FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libmupdf-dev mupdf-tools \
    && rm -rf /var/lib/apt/lists/*

ENV PIP_DEFAULT_TIMEOUT=120 \
    PIP_RETRIES=5

# Pre-install CPU-only torch from a local wheel (avoids the flaky pytorch.org
# CDN and the ~2GB CUDA bundle on PyPI).
COPY torch-2.13.0+cpu-cp312-cp312-manylinux_2_28_x86_64.whl /tmp/torch-2.13.0+cpu-cp312-cp312-manylinux_2_28_x86_64.whl
RUN pip install --no-cache-dir /tmp/torch-2.13.0+cpu-cp312-cp312-manylinux_2_28_x86_64.whl && rm /tmp/torch-2.13.0+cpu-cp312-cp312-manylinux_2_28_x86_64.whl
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY main.py .

# Runtime mount points for read-only parent packages (set by docker-compose).
# /packages/document_processing, /packages/retrieval, /packages/types
# Each is the package root itself, so the parent /packages must be on the path.
ENV PYTHONPATH=/packages

EXPOSE 8001

CMD ["python", "main.py"]
