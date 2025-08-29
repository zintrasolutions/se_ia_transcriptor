# 🐳 Docker Setup for Video Transcription App

This guide explains how to run the video transcription application using Docker on Apple Silicon (ARM64).

## 📋 Prerequisites

- **Docker Desktop** installed and running
- **Apple Silicon Mac** (M1/M2/M3) or compatible ARM64 system
- **At least 8GB RAM** (16GB recommended for AI models)
- **At least 10GB free disk space** for models and videos

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd seia-transcriptor

# Run the automated build script
./docker-build.sh
```

The script will:
- Build the Docker image for ARM64
- Download Llama 3.1 and other AI models
- Start the application and Ollama services
- Configure all necessary volumes and networks

### Option 2: Manual Setup

```bash
# Build the Docker image
docker build --platform linux/arm64 -t seia-transcriptor:latest .

# Start services with docker-compose
docker-compose up -d
```

## 📁 Project Structure

```
seia-transcriptor/
├── Dockerfile                 # Main Docker configuration
├── docker-compose.yml         # Service orchestration
├── docker-entrypoint.sh       # Container startup script
├── docker-init.sh            # Model initialization script
├── docker-build.sh           # Automated build script
├── .dockerignore             # Files to exclude from build
├── projects/                 # Project data (persisted)
├── uploads/                  # Uploaded videos (persisted)
├── output/                   # Generated videos (persisted)
└── subtitles/                # Subtitle files (persisted)
```

## 🤖 AI Models Included

The Docker setup automatically downloads and configures:

### Core Models
- **llama2:3.1b** - Llama 3.1 3B parameters (fast, efficient)
- **llama2:7b** - Llama 2 7B parameters (balanced performance)
- **llama2:13b** - Llama 2 13B parameters (high quality)

### Additional Models
- **mistral:7b** - Mistral 7B (alternative model)
- **codellama:7b** - Code Llama (for code-related content)

## 🌐 Services

### Main Application
- **URL**: http://localhost:3001
- **Port**: 3001
- **Features**: Video upload, transcription, translation, export

### Ollama AI Service
- **URL**: http://localhost:11434
- **Port**: 11434
- **Features**: Local AI model inference

## 📊 Resource Requirements

### Minimum Requirements
- **RAM**: 8GB
- **Storage**: 10GB
- **CPU**: Apple M1 or equivalent

### Recommended Requirements
- **RAM**: 16GB+
- **Storage**: 20GB+
- **CPU**: Apple M2/M3 or equivalent

## 🔧 Configuration

### Environment Variables

You can customize the application by setting environment variables:

```bash
# In docker-compose.yml or when running containers
NODE_ENV=production
PORT=3001
WHISPER_MODEL=base
WHISPER_LANGUAGE=en
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2:3.1b
```

### Model Selection

To use different AI models, modify the `OLLAMA_MODEL` environment variable:

```bash
# Fast model (3B parameters)
OLLAMA_MODEL=llama2:3.1b

# Balanced model (7B parameters)
OLLAMA_MODEL=llama2:7b

# High quality model (13B parameters)
OLLAMA_MODEL=llama2:13b

# Alternative model
OLLAMA_MODEL=mistral:7b
```

## 📝 Usage

### Starting the Application

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Managing Models

```bash
# List available models
curl http://localhost:11434/api/tags

# Download additional models
docker exec -it ollama ollama pull llama2:70b

# Remove models
docker exec -it ollama ollama rm llama2:13b
```

### Accessing the Application

1. Open your browser and go to **http://localhost:3001**
2. Upload a video file (MP4, AVI, MOV, MKV, WEBM, M4V)
3. Select source and target languages
4. Start transcription and translation
5. Export results as SRT files or videos with embedded subtitles

## 🔍 Troubleshooting

### Common Issues

#### 1. Container Fails to Start
```bash
# Check container logs
docker-compose logs seia-transcriptor

# Check Ollama logs
docker-compose logs ollama
```

#### 2. Models Not Downloading
```bash
# Check Ollama service
curl http://localhost:11434/api/tags

# Restart Ollama service
docker-compose restart ollama
```

#### 3. Out of Memory
```bash
# Check memory usage
docker stats

# Reduce model size
export OLLAMA_MODEL=llama2:3.1b
docker-compose up -d
```

#### 4. Port Already in Use
```bash
# Check what's using the port
lsof -i :3001
lsof -i :11434

# Stop conflicting services
sudo kill -9 <PID>
```

### Performance Optimization

#### For Better Performance
1. **Use smaller models** for faster processing
2. **Increase Docker memory** allocation in Docker Desktop
3. **Use SSD storage** for better I/O performance
4. **Close other applications** to free up RAM

#### For Better Quality
1. **Use larger models** (13B+ parameters)
2. **Increase Docker CPU** allocation
3. **Use dedicated GPU** if available

## 🧹 Maintenance

### Cleaning Up

```bash
# Remove unused containers and images
docker system prune -a

# Remove unused volumes
docker volume prune

# Clean up project data
rm -rf uploads/* output/* subtitles/*
```

### Updating

```bash
# Pull latest changes
git pull

# Rebuild and restart
./docker-build.sh
```

### Backup

```bash
# Backup project data
tar -czf backup-$(date +%Y%m%d).tar.gz projects/ uploads/ output/ subtitles/

# Restore from backup
tar -xzf backup-20231201.tar.gz
```

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review container logs: `docker-compose logs -f`
3. Ensure sufficient disk space and memory
4. Check the troubleshooting section above

## 🔒 Security Notes

- The application runs locally and doesn't send data to external servers
- AI models are downloaded and run locally
- Video files are stored in local volumes
- No internet connection required after initial setup

## 📈 Performance Tips

1. **First Run**: Initial model download may take 10-30 minutes
2. **Subsequent Runs**: Models are cached and start much faster
3. **Video Processing**: Depends on video length and model size
4. **Memory Usage**: Monitor with `docker stats` during processing

---

**Happy Transcribing! 🎬✨**
