"""
AI Training Service — FastAPI wrapper that invokes the
`mentorai_finetuning.training.train` CLI exactly as a manual
`mentorai-cli train ...` invocation.

This service does NOT modify the mentorai-finetuning package. It builds the
CLI argument vector from the request (base model + dataset link) and calls the
package's own parser + `main()` in a background thread.
"""
import ast
import contextlib
import os
import re
import shutil
import sys
import uuid
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field

# Add the parent package source dir to sys.path so we can import it.
PACKAGE_SRC = os.environ.get(
    "MENTORAI_FINETUNING_SRC",
    "/packages/mentorai-finetuning/src",
)
if PACKAGE_SRC not in sys.path:
    sys.path.insert(0, PACKAGE_SRC)


app = FastAPI(
    title="MentorAI Training Service",
    description="Invokes mentorai_finetuning.training.train.main() with CLI-style args",
    version="1.0.0",
)


class JobStatus(str, Enum):
    queued = "queued"
    preparing = "preparing"
    running = "running"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


# In-memory job store (replace with Postgres in production).
JOBS: Dict[str, Dict[str, Any]] = {}


class CreateJobRequest(BaseModel):
    name: str
    base_model: str = Field(..., description="HF model id, e.g. 'Qwen/Qwen2.5-1.5B-Instruct'")
    train_dataset: str = Field(..., description="Path to training jsonl file")
    validation_dataset: Optional[str] = None
    output_dir: str = "/output/adapters"
    dataset_source: Optional[str] = Field(
        None,
        description="Optional URL / HF dataset id to download into train_dataset first",
    )
    dataset_adapter: str = Field("chatml", description="Dataset format: alpaca|chatml|openai|sharegpt")
    config: Dict[str, Any] = Field(default_factory=dict)


class JobResponse(BaseModel):
    job_id: str
    status: JobStatus
    name: str
    base_model: str
    train_dataset: str
    output_dir: str
    dataset_adapter: str = "chatml"
    adapter_path: Optional[str] = None
    created_at: str
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    error: Optional[str] = None
    progress: int = 0
    current_step: int = 0
    total_steps: int = 0
    final_metrics: Optional[Dict[str, Any]] = None


def _serialize_job(job: Dict[str, Any]) -> JobResponse:
    return JobResponse(**{k: v for k, v in job.items() if not k.startswith("_")})


class _ProgressCapture:
    """
    File-like sink that tees trainer output while scanning it for progress.

    The HF Trainer renders a tqdm bar (``12%|█▏ | 3/25 [00:10<...``) and a
    final ``{'train_runtime': ..., 'train_loss': ...}`` summary. We parse both
    so the API can expose live progress without touching the framework.
    """

    _BAR_RE = re.compile(r"(\d{1,3})%\|[^|]*\|\s*(\d+)/(\d+)")
    _SUMMARY_KEYS = ("train_loss", "train_runtime")

    def __init__(self, job_id: str):
        self.job_id = job_id
        self._buffer = ""

    def _parse(self, chunk: str) -> None:
        job = JOBS.get(self.job_id)
        if job is None:
            return

        for match in self._BAR_RE.finditer(chunk):
            pct, step, total = int(match.group(1)), int(match.group(2)), int(match.group(3))
            job["progress"] = min(pct, 99)
            job["current_step"] = step
            job["total_steps"] = total

        stripped = chunk.lstrip()
        if stripped.startswith("{") and all(k in stripped for k in self._SUMMARY_KEYS):
            try:
                metrics = ast.literal_eval(stripped.strip())

                def _num(value: Any) -> Any:
                    """Trainer summaries print numbers as strings ('3.362')."""
                    if isinstance(value, str):
                        try:
                            return float(value)
                        except ValueError:
                            return value
                    return value

                job["final_metrics"] = {
                    k: _num(v)
                    for k, v in metrics.items()
                    if isinstance(v, (int, float, str))
                }
                job["progress"] = 100
            except (ValueError, SyntaxError):
                pass

    def write(self, text: str) -> int:
        # Echo through so `docker logs` still shows everything.
        try:
            sys.__stderr__.write(text)
            sys.__stderr__.flush()
        except Exception:  # noqa: BLE001
            pass

        self._buffer += text
        # tqdm rewrites lines with \r; treat \r and \n both as flush points.
        parts = re.split(r"[\r\n]", self._buffer)
        self._buffer = parts[-1]
        for part in parts[:-1]:
            self._parse(part)
        # Also scan the live partial fragment so percentages update in real time.
        if self._buffer:
            self._parse(self._buffer)
        return len(text)

    def flush(self) -> None:
        pass


def _split_validation(request: CreateJobRequest, train_path: Path) -> None:
    """
    Hold out a validation split from a local train file (mirrors the
    framework's ``data prepare`` val_ratio behaviour). If the dataset is too
    small to split, the requested validation path is dropped so the train CLI
    runs without ``--val-dataset``.
    """
    if not request.validation_dataset:
        return
    ratio = float(request.config.get("val_ratio", 0.1))
    lines = [ln for ln in train_path.read_text(encoding="utf-8").splitlines() if ln.strip()]
    val_count = int(len(lines) * ratio)
    if len(lines) < 4 or val_count < 1:
        print(f"Dataset too small for a validation split ({len(lines)} lines); skipping --val-dataset")
        request.validation_dataset = None
        return

    import random

    rng = random.Random(int(request.config.get("seed", 42)))
    rng.shuffle(lines)
    val_lines, train_lines = lines[:val_count], lines[val_count:]
    train_path.write_text("\n".join(train_lines) + "\n", encoding="utf-8")
    val_path = Path(request.validation_dataset)
    val_path.parent.mkdir(parents=True, exist_ok=True)
    val_path.write_text("\n".join(val_lines) + "\n", encoding="utf-8")
    print(f"Split {len(train_lines)} train / {len(val_lines)} validation samples")


def _acquire_dataset(request: CreateJobRequest) -> None:
    """
    Materialise the training dataset before invoking the framework.

    Supports the same inputs the user would use manually:

    * ``dataset_source`` as an ``https://...`` JSON/JSONL URL → downloaded to
      ``train_dataset`` (and, if present, ``validation_dataset``).
    * ``dataset_source`` as a Hugging Face dataset id (e.g.
      ``databricks/databricks-dolly-15k``) → uses the framework's
      ``data prepare`` pipeline to write train/validation JSONL.

    When no ``dataset_source`` is given, ``train_dataset`` is used as-is.
    """
    source = (request.dataset_source or "").strip()
    if not source:
        return

    train_path = Path(request.train_dataset)
    train_path.parent.mkdir(parents=True, exist_ok=True)

    # Local file path (e.g. the framework's own prepared data) → copy as-is.
    src = Path(source)
    if src.is_file():
        print(f"Using local dataset {src}")
        shutil.copy(src, train_path)
        _split_validation(request, train_path)
        return

    if source.startswith(("http://", "https://")):
        import urllib.request

        print(f"Downloading dataset from {source}")
        tmp = train_path.with_suffix(".download")
        urllib.request.urlretrieve(source, tmp)
        tmp.rename(train_path)
        print(f"Dataset saved to {train_path}")
        return

    # Otherwise treat as a Hugging Face dataset id → reuse the framework's
    # preparation pipeline (same code path as `mentorai-cli data prepare`).
    from mentorai_finetuning.dataset.hf_prepare import prepare

    print(f"Preparing HF dataset {source} via the framework")
    out_dir = train_path.parent
    max_samples = request.config.get("max_samples")
    train_out, val_out = prepare(
        hf_dataset=source,
        adapter_name=request.dataset_adapter,
        output_dir=out_dir,
        val_ratio=float(request.config.get("val_ratio", 0.1)),
        **({"max_samples": int(max_samples)} if max_samples else {}),
    )
    if str(train_out) != str(train_path):
        train_out.rename(train_path)
    if val_out.exists() and request.validation_dataset:
        Path(request.validation_dataset).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(val_out, request.validation_dataset)


def _build_train_argv(request: CreateJobRequest) -> list[str]:
    """
    Build the exact argv the framework's ``train`` CLI parser expects,
    mirroring a manual ``mentorai-cli train ...`` invocation.
    """
    argv = [
        "--dataset",
        request.train_dataset,
        "--model",
        request.base_model,
        "--output-dir",
        request.output_dir,
        "--adapter",
        request.dataset_adapter,
    ]
    if request.validation_dataset:
        argv += ["--val-dataset", request.validation_dataset]

    for key, flag in {
        "method": "--method",
        "epochs": "--epochs",
        "batch_size": "--batch-size",
        "eval_batch_size": "--eval-batch-size",
        "learning_rate": "--learning-rate",
        "max_seq_length": "--max-length",
        "seed": "--seed",
        "lora_rank": "--lora-rank",
        "lora_alpha": "--lora-alpha",
        "lora_dropout": "--lora-dropout",
        "packing": "--packing",
    }.items():
        if key in request.config and request.config[key] is not None:
            argv += [flag, str(request.config[key])]

    return argv


def _run_training(job_id: str, request: CreateJobRequest) -> None:
    """Background task: invoke the package's train main() in a thread."""
    job = JOBS[job_id]
    job["status"] = JobStatus.preparing
    job["started_at"] = datetime.utcnow().isoformat()

    try:
        _acquire_dataset(request)

        from mentorai_finetuning.training.train import (
            build_parser as build_train_parser,
        )
        from mentorai_finetuning.training.train import main as run_train

        args = build_train_parser().parse_args(_build_train_argv(request))

        job["status"] = JobStatus.running

        # Capture the trainer's stdout/stderr to expose live progress while
        # still echoing everything through to the container logs.
        capture = _ProgressCapture(job_id)
        with contextlib.redirect_stdout(capture), contextlib.redirect_stderr(capture):
            run_train(args)

        job["progress"] = 100

        job["status"] = JobStatus.completed
        job["adapter_path"] = request.output_dir
    except SystemExit as e:
        job["status"] = JobStatus.failed
        job["error"] = f"CLI exited: {e}"
    except Exception as e:  # noqa: BLE001
        job["status"] = JobStatus.failed
        job["error"] = repr(e)[:1000]
    finally:
        job["completed_at"] = datetime.utcnow().isoformat()


@app.get("/health")
async def health():
    return {"status": "ok", "service": "training"}


@app.post("/jobs", response_model=JobResponse)
async def create_job(request: CreateJobRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())
    job = {
        "job_id": job_id,
        "status": JobStatus.queued,
        "name": request.name,
        "base_model": request.base_model,
        "train_dataset": request.train_dataset,
        "output_dir": request.output_dir,
        "dataset_adapter": request.dataset_adapter,
        "created_at": datetime.utcnow().isoformat(),
    }
    JOBS[job_id] = job
    background_tasks.add_task(_run_training, job_id, request)
    return _serialize_job(job)


@app.get("/jobs", response_model=List[JobResponse])
async def list_jobs():
    return [_serialize_job(j) for j in JOBS.values()]


@app.get("/jobs/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    return _serialize_job(JOBS[job_id])


@app.post("/jobs/{job_id}/cancel")
async def cancel_job(job_id: str):
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    job = JOBS[job_id]
    if job["status"] in (JobStatus.completed, JobStatus.failed, JobStatus.cancelled):
        raise HTTPException(status_code=400, detail=f"Job already {job['status']}")
    job["status"] = JobStatus.cancelled
    job["completed_at"] = datetime.utcnow().isoformat()
    return {"job_id": job_id, "status": job["status"]}


@app.post("/jobs/{job_id}/start")
async def start_job(job_id: str, request: CreateJobRequest, background_tasks: BackgroundTasks):
    if job_id not in JOBS:
        raise HTTPException(status_code=404, detail="Job not found")
    job = JOBS[job_id]
    if job["status"] != JobStatus.queued:
        raise HTTPException(status_code=400, detail="Job already started")
    background_tasks.add_task(_run_training, job_id, request)
    return {"job_id": job_id, "status": "starting"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
