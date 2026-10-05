FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# The mentorai-finetuning framework is part of the monorepo; the build context
# is the repo root (see docker-compose build.context). We install it with pip
# exactly like a manual setup:
#   pip install -e '/packages/mentorai-finetuning[training]'
# We use pip's PEP 735 --group selector instead because the training/inference
# dependencies are declared as dependency-groups in the framework's pyproject.toml.
COPY packages/mentorai-finetuning /packages/mentorai-finetuning
# The version pins below mirror the framework's own uv.lock (the versions
# verified working with `mentorai-cli train`); newer releases of
# transformers/trl drop kwargs the framework passes (e.g. warmup_ratio).
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir \
        -e /packages/mentorai-finetuning \
        --group /packages/mentorai-finetuning/pyproject.toml:training \
        --group /packages/mentorai-finetuning/pyproject.toml:inference \
        "transformers==5.13.*" "tokenizers==0.22.*" "trl==1.8.*" "peft==0.19.*" \
        "datasets==5.0.*" "accelerate==1.14.*" "bitsandbytes==0.49.*"

# main.py is mounted from the host at runtime (see docker-compose volumes).
COPY src/apps/web/backend/ai-services/training-service/main.py .

ENV PYTHONUNBUFFERED=1
ENV MENTORAI_FINETUNING_SRC=/packages/mentorai-finetuning/src
ENV PYTHONPATH=/packages/mentorai-finetuning/src

EXPOSE 8002

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8002"]
