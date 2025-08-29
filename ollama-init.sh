#!/bin/bash

# Ollama initialization script
# This script starts Ollama and downloads the required models

set -e

echo "🤖 Starting Ollama with model initialization..."

# Start Ollama in the background
echo "Starting Ollama service..."
ollama serve &
OLLAMA_PID=$!

# Wait for Ollama to be ready
echo "Waiting for Ollama to be ready..."
sleep 10

# Check if models are already downloaded
echo "Checking for existing models..."
if ollama list | grep -q "llama3.1"; then
    echo "✅ Model llama3.1 already exists, skipping download"
else
    echo "📥 Downloading llama3.1 model..."
    ollama pull llama3.1
    echo "✅ Model llama3.1 downloaded successfully"
fi

# List available models
echo "📋 Available models:"
ollama list

echo "🚀 Ollama is ready with models!"

# Wait for the Ollama process
wait $OLLAMA_PID
