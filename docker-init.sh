#!/bin/bash

# Script to initialize Ollama models
# This script should be run after the Ollama service is started

set -e

echo "🤖 Initializing Ollama models..."

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
        if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
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

# Wait for Ollama to be ready
if check_ollama; then
    # Check if models are already downloaded
    if curl -s http://localhost:11434/api/tags | grep -q "llama3.1"; then
        print_status "Models already downloaded, skipping initialization"
    else
        # Download essential models
        print_status "Downloading essential models..."
        
        # Download Llama 3.1 (3B parameters - fast and efficient)
        if curl -X POST http://localhost:11434/api/pull -d '{"name": "llama3.1"}'; then
            print_success "Downloaded llama3.1"
        else
            print_warning "Failed to download llama3.1"
        fi
        
        # List available models
        print_status "Available models:"
        curl -s http://localhost:11434/api/tags | jq '.models[] | .name' 2>/dev/null || echo "No models found"
    fi
else
    print_warning "Ollama service not available"
fi

print_success "AI model initialization completed!"
print_status "You can now use the video transcription application with local AI models."
