#!/bin/bash

# Docker entrypoint script for video transcription app
# This script initializes AI models and starts the application

set -e

echo "🚀 Starting video transcription application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if Ollama is ready
check_ollama() {
    local max_attempts=30
    local attempt=0
    
    print_status "Checking Ollama service..."
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s http://ollama:11434/api/tags > /dev/null 2>&1; then
            print_success "Ollama service is ready"
            return 0
        else
            attempt=$((attempt + 1))
            print_status "Waiting for Ollama service... (attempt $attempt/$max_attempts)"
            sleep 2
        fi
    done
    
    print_error "Ollama service failed to start"
    return 1
}



# Wait for external Ollama service to be ready
print_status "Waiting for external Ollama service..."
if check_ollama; then
    print_success "External Ollama service is ready"
else
    print_warning "External Ollama service not available, continuing without local AI models"
fi

# Set default environment variables
export NODE_ENV=${NODE_ENV:-production}
export PORT=${PORT:-3001}
export WHISPER_MODEL=${WHISPER_MODEL:-base}
export WHISPER_LANGUAGE=${WHISPER_LANGUAGE:-en}
export OLLAMA_BASE_URL=${OLLAMA_BASE_URL:-http://localhost:11434}
export OLLAMA_MODEL=${OLLAMA_MODEL:-llama2:3.1b}

print_status "Environment configuration:"
print_status "  NODE_ENV: $NODE_ENV"
print_status "  PORT: $PORT"
print_status "  WHISPER_MODEL: $WHISPER_MODEL"
print_status "  WHISPER_LANGUAGE: $WHISPER_LANGUAGE"
print_status "  OLLAMA_BASE_URL: $OLLAMA_BASE_URL"
print_status "  OLLAMA_MODEL: $OLLAMA_MODEL"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads output subtitles projects

# Set permissions
chmod 755 uploads output subtitles projects

# Start the application
print_status "Starting video transcription application..."
print_success "Application will be available at http://localhost:$PORT"

# Execute the main command
exec "$@"
