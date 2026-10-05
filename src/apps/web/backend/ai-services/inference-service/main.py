"""
AI Inference Service — OpenAI-compatible chat completions + embeddings.

This service uses the existing (read-only) `mentorai_finetuning` deployment
package: `DeploymentLoader` loads the model/tokenizer and `TransformersBackend`
performs generation. It deliberately imports the transformers backend pieces
directly (instead of `deployment.pipeline`) because that module pulls in a
hard `vllm` dependency that is not installed in this CPU-only image.

No code from `packages/` is modified.
"""
import os
import sys
import threading
import uuid
from typing import List, Optional

PACKAGE_SRC = os.environ.get(
    "MENTORAI_FINETUNING_SRC",
    "/packages/mentorai-finetuning/src",
)
if PACKAGE_SRC not in sys.path:
    sys.path.insert(0, PACKAGE_SRC)

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from mentorai_finetuning.deployment.backend.types import BackendType
from mentorai_finetuning.deployment.config import DeploymentConfig
from mentorai_finetuning.deployment.inference import (
    InferenceMessage,
    InferenceRequest,
    InferenceRole,
)

app = FastAPI(
    title="MentorAI Inference Service",
    description="LLM inference (chat completions) + embeddings via mentorai-finetuning deployment package",
    version="1.0.0",
)

# ── Lazy singleton pipeline ────────────────────────────────────────────────────
_pipeline = None
_pipeline_lock = threading.Lock()


def get_pipeline():
    """Load the transformers backend lazily on first request."""
    global _pipeline
    if _pipeline is not None:
        return _pipeline
    with _pipeline_lock:
        if _pipeline is None:
            from mentorai_finetuning.deployment.backend.transformers_backend import (
                TransformersBackend,
            )
            from mentorai_finetuning.deployment.loader import (
                DeploymentLoader,
            )

            config = DeploymentConfig(
                model_name=os.environ.get(
                    "DEPLOYMENT_MODEL_NAME",
                    "Qwen/Qwen2.5-0.5B-Instruct",
                ),
                backend=BackendType.TRANSFORMERS,
                device=os.environ.get("DEPLOYMENT_DEVICE", "cpu"),
                temperature=float(os.environ.get("DEPLOYMENT_TEMPERATURE", "0.2")),
                top_p=float(os.environ.get("DEPLOYMENT_TOP_P", "0.9")),
                top_k=int(os.environ.get("DEPLOYMENT_TOP_K", "50")),
                repetition_penalty=float(
                    os.environ.get("DEPLOYMENT_REPETITION_PENALTY", "1.15")
                ),
                max_new_tokens=int(os.environ.get("DEPLOYMENT_MAX_NEW_TOKENS", "256")),
            )
            model, tokenizer = DeploymentLoader(config).load()
            _pipeline = {
                "config": config,
                "model": model,
                "tokenizer": tokenizer,
                "backend": TransformersBackend(
                    model=model,
                    tokenizer=tokenizer,
                    config=config,
                ),
            }
    return _pipeline


# ── Request/Response models (mirror OpenAI API) ───────────────────────────────

class ChatMessage(BaseModel):
    role: str
    content: str


class ChatCompletionRequest(BaseModel):
    model: Optional[str] = None
    messages: List[ChatMessage] = Field(min_length=1)
    max_tokens: Optional[int] = None
    temperature: Optional[float] = None
    top_p: Optional[float] = None
    stream: bool = False


class BatchEmbedRequest(BaseModel):
    texts: List[str]


class BatchEmbedResponse(BaseModel):
    embeddings: List[List[float]]
    model: str
    count: int


# ── Model management (framework HF cache) ─────────────────────────────────────
# Models are downloaded into the same /root/.cache/huggingface that
# DeploymentLoader.from_pretrained reads, i.e. "installed" means the framework
# can load the repo directly.

CACHE_DIR = os.environ.get(
    "HF_HOME", os.path.join(os.path.expanduser("~"), ".cache", "huggingface")
)
INSTALL_JOBS: dict[str, dict] = {}
INSTALL_LOCK = threading.Lock()


def _installed_repos() -> set[str]:
    """Return repo ids whose snapshots exist in the framework HF cache."""
    hub = os.path.join(CACHE_DIR, "hub")
    if not os.path.isdir(hub):
        return set()
    repos = set()
    for entry in os.listdir(hub):
        if entry.startswith("models--"):
            repos.add(entry[len("models--") :].replace("--", "/"))
    return repos


class InstallRequest(BaseModel):
    repo_id: str


class UninstallRequest(BaseModel):
    repo_id: str


@app.get("/models/installed")
async def list_installed_models():
    """List base-model ids the framework already has cached locally."""
    return {"models": sorted(_installed_repos())}


def _snapshot_download_worker(repo_id: str, cache_dir: str) -> None:
    """Process entry point: download a repo snapshot into the HF cache."""
    from huggingface_hub import snapshot_download

    snapshot_download(
        repo_id,
        cache_dir=cache_dir,
        local_files_only=False,
    )


@app.post("/models/install")
async def install_model(request: InstallRequest):
    """Download a base model into the framework HF cache (background)."""
    import multiprocessing

    job_id = str(uuid.uuid4())
    INSTALL_JOBS[job_id] = {
        "repo_id": request.repo_id,
        "status": "downloading",
        "progress": 0,
    }

    proc = multiprocessing.Process(
        target=_snapshot_download_worker,
        args=(request.repo_id, CACHE_DIR),
        daemon=True,
    )
    INSTALL_JOBS[job_id]["_process"] = proc
    proc.start()

    def _reap():
        proc.join()
        job = INSTALL_JOBS.get(job_id)
        if job is None or job["status"] != "downloading":
            return  # cancelled / already finalised
        job.update(
            {"status": "installed", "progress": 100}
            if proc.exitcode == 0
            else {"status": "failed", "error": f"download exited with code {proc.exitcode}"}
        )

    threading.Thread(target=_reap, daemon=True).start()
    return {"job_id": job_id, "status": "downloading"}


@app.get("/models/install/{job_id}")
async def get_install_status(job_id: str):
    job = INSTALL_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Install job not found")
    return {k: v for k, v in job.items() if k != "_process"}


@app.post("/models/install/{job_id}/cancel")
async def cancel_install(job_id: str):
    """Abort a running download: kill its process and drop partial files."""
    import shutil

    job = INSTALL_JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Install job not found")
    if job["status"] != "downloading":
        raise HTTPException(status_code=400, detail=f"Job already {job['status']}")

    proc = job.get("_process")
    if proc is not None and proc.is_alive():
        proc.terminate()
        proc.join(timeout=10)
        if proc.is_alive():
            proc.kill()

    # Remove any partially downloaded snapshot so the model shows as not installed.
    safe = str(job["repo_id"]).replace("/", "--")
    shutil.rmtree(os.path.join(CACHE_DIR, "hub", f"models--{safe}"), ignore_errors=True)

    job["status"] = "cancelled"
    return {"job_id": job_id, "status": "cancelled"}


@app.delete("/models")
async def uninstall_model(request: UninstallRequest):
    """Remove a repo's snapshot from the framework HF cache."""
    import shutil

    safe = request.repo_id.replace("/", "--")
    snapshot = os.path.join(CACHE_DIR, "hub", f"models--{safe}")
    removed = False
    if os.path.isdir(snapshot):
        shutil.rmtree(snapshot, ignore_errors=True)
        removed = True
    return {"removed": removed, "repo_id": request.repo_id}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "inference"}


@app.post("/v1/chat/completions")
async def chat_completions(request: ChatCompletionRequest):
    pipeline = get_pipeline()
    config = pipeline["config"]

    inference_request = InferenceRequest(
        messages=[
            InferenceMessage(
                role=InferenceRole(message.role),
                content=message.content,
            )
            for message in request.messages
        ],
    )

    result = pipeline["backend"].generate(inference_request)

    # Build OpenAI-compatible usage from the tokenizer + prompt.
    from mentorai_finetuning.deployment.request_builder import (
        InferenceRequestBuilder,
    )

    builder = InferenceRequestBuilder(pipeline["tokenizer"])
    prompt = builder.build(inference_request)
    prompt_tokens = len(pipeline["tokenizer"].encode(prompt))
    completion_tokens = len(
        pipeline["tokenizer"].encode(result, add_special_tokens=False)
    )

    if request.stream:
        def event_stream():
            yield f"data: {_chunk_json('assistant', '', '')}\n\n"
            # Stream the generated text in coarse chunks for CPU inference.
            chunk = ""
            for part in _chunk_text(result, 16):
                chunk += part
                yield f"data: {_chunk_json('assistant', part, None)}\n\n"
            yield f"data: {_chunk_json('assistant', '', 'stop')}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            },
        )

    return {
        "id": f"chatcmpl-{uuid.uuid4().hex}",
        "object": "chat.completion",
        "created": int(__import__("time").time()),
        "model": config.model_name,
        "choices": [
            {
                "index": 0,
                "message": {"role": "assistant", "content": result},
                "finish_reason": "stop",
            }
        ],
        "usage": {
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
        },
    }


def _chunk_json(role: str, content: str, finish_reason: Optional[str]):
    import json

    choice = {
        "index": 0,
        "delta": {"role": role, "content": content},
    }
    if finish_reason is not None:
        choice["finish_reason"] = finish_reason
    return json.dumps(
        {
            "id": f"chatcmpl-{uuid.uuid4().hex}",
            "object": "chat.completion.chunk",
            "created": int(__import__("time").time()),
            "model": "local",
            "choices": [choice],
        }
    )


def _chunk_text(text: str, size: int):
    for i in range(0, len(text), size):
        yield text[i : i + size]


@app.post("/batch-embed", response_model=BatchEmbedResponse)
async def batch_embed(request: BatchEmbedRequest):
    """Generate embeddings using sentence-transformers."""
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError as e:
        raise HTTPException(status_code=500, detail=f"sentence-transformers not installed: {e}")

    model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    vectors = model.encode(request.texts, convert_to_numpy=True)
    return BatchEmbedResponse(
        embeddings=vectors.tolist(),
        model="sentence-transformers/all-MiniLM-L6-v2",
        count=len(vectors),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
