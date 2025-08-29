#!/bin/bash

# Docker build script for Apple Silicon (ARM64)
# Video Transcription Application

set -e

echo "🐳 Building Docker image for Apple Silicon (ARM64)..."

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

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Check if we're on Apple Silicon
if [[ $(uname -m) != "arm64" ]]; then
    print_warning "This script is optimized for Apple Silicon (ARM64). You're running on $(uname -m)."
fi

# Create necessary directories if they don't exist
print_status "Creating necessary directories..."
mkdir -p projects uploads output subtitles

# Set permissions
chmod 755 projects uploads output subtitles

# Build the Docker image
print_status "Building Docker image..."
docker build \
    --platform linux/arm64 \
    --tag seia-transcriptor:latest \
    --file Dockerfile \
    .

if [ $? -eq 0 ]; then
    print_success "Docker image built successfully!"
else
    print_error "Failed to build Docker image."
    exit 1
fi

# Ask user if they want to run the container
echo ""
read -p "Do you want to run the container now? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting container..."
    
    # Stop existing container if running
    if docker ps -q -f name=seia-transcriptor | grep -q .; then
        print_status "Stopping existing container..."
        docker stop seia-transcriptor
        docker rm seia-transcriptor
    fi
    
    # Run the container with Ollama
    print_status "Starting containers with docker-compose..."
    
    # Stop existing containers
    docker-compose down 2>/dev/null || true
    
    # Start containers
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        print_success "Containers started successfully!"
        echo ""
        print_status "Application is running at: http://localhost:3001"
        print_status "Ollama service is running at: http://localhost:11434"
        print_status "To view logs: docker-compose logs -f"
        print_status "To stop: docker-compose down"
        echo ""
        
        # Wait for services to start
        print_status "Waiting for services to start..."
        sleep 30
        
        # Check if the application is responding
        if curl -s http://localhost:3001 > /dev/null; then
            print_success "Application is responding!"
        else
            print_warning "Application might still be starting up. Please wait a moment and check http://localhost:3001"
        fi
        
        # Check Ollama models
        print_status "Checking Ollama models..."
        if curl -s http://localhost:11434/api/tags > /dev/null; then
            print_success "Ollama service is running!"
            print_status "Available models:"
            curl -s http://localhost:11434/api/tags | jq -r '.models[].name' 2>/dev/null || echo "No models found yet"
        else
            print_warning "Ollama service might still be starting up"
        fi
    else
        print_error "Failed to start containers."
        exit 1
    fi
    
    if [ $? -eq 0 ]; then
        print_success "Container started successfully!"
        echo ""
        print_status "Application is running at: http://localhost:3001"
        print_status "To view logs: docker logs -f seia-transcriptor"
        print_status "To stop: docker stop seia-transcriptor"
        echo ""
        
        # Wait a moment for the container to start
        sleep 5
        
        # Check if the application is responding
        if curl -s http://localhost:3001 > /dev/null; then
            print_success "Application is responding!"
        else
            print_warning "Application might still be starting up. Please wait a moment and check http://localhost:3001"
        fi
    else
        print_error "Failed to start container."
        exit 1
    fi
else
    print_status "Container not started. You can run it manually with:"
    echo "docker run -d --name seia-transcriptor --platform linux/arm64 -p 3001:3001 -v \$(pwd)/projects:/app/projects -v \$(pwd)/uploads:/app/uploads -v \$(pwd)/output:/app/output -v \$(pwd)/subtitles:/app/subtitles seia-transcriptor:latest"
fi

print_success "Build process completed!"
