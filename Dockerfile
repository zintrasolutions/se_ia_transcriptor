# Dockerfile for Apple Silicon (ARM64) - Video Transcription App
FROM --platform=linux/arm64 python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies for video processing and AI tools
RUN apt-get update && apt-get install -y \
    # Video processing
    ffmpeg \
    # Node.js
    curl \
    # Build tools
    build-essential \
    # Audio processing
    sox \
    # Git for potential model downloads
    git \
    # Additional libraries
    libffi-dev \
    libssl-dev \
    # Clean up
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

# Install Python dependencies for Whisper
RUN pip3 install --no-cache-dir --break-system-packages \
    openai-whisper \
    torch \
    torchaudio \
    numpy \
    scipy \
    librosa \
    transformers \
    accelerate

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --omit=dev

# Copy application files
COPY . .

# Create necessary directories
RUN mkdir -p uploads output subtitles projects

# Set permissions
RUN chmod +x *.sh

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3001/ || exit 1

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]

# Default command
CMD ["npm", "start"]
