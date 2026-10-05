FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

ENV PIP_DEFAULT_TIMEOUT=120 \
    PIP_RETRIES=5

# Install inference-service deps. mentorai-finetuning is mounted at runtime
# via docker-compose volume to /packages/mentorai-finetuning.
# Torch comes from PyTorch's official CPU package index (no vendored wheel,
# avoids the multi-GB CUDA bundle on PyPI).
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

ENV PYTHONUNBUFFERED=1
ENV MENTORAI_FINETUNING_SRC=/packages/mentorai-finetuning/src
ENV PYTHONPATH=/packages/mentorai-finetuning/src

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
