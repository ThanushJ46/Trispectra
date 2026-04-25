FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (needed for OpenCV and other ML libraries)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the entire backend directory into the container
COPY . .

# Expose the Cloud Run default port
# Cloud Run uses 8080, Hugging Face uses 7860. This handles both!
EXPOSE 7860
EXPOSE 8080

# Command to run the FastAPI app using the PORT environment variable (defaults to 7860 for Hugging Face)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]
