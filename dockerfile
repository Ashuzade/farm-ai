# ── Base image ──
FROM python:3.11-slim

# ── Set working directory ──
WORKDIR /app

# ── Install system dependencies ──
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# ── Copy requirements first (for caching) ──
COPY requirements.txt .

# ── Install Python dependencies ──
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ── Copy entire project ──
COPY . .

# ── Create necessary directories ──
RUN mkdir -p data/uploads models

# ── Expose port ──
EXPOSE 8000

# ── Start FastAPI server ──
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]