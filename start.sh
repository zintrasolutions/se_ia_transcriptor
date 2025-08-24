#!/bin/bash

# Privacy IA Local Transcriptor - Script de démarrage
echo "🎬 Privacy IA Local Transcriptor - Démarrage de l'application..."

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/"
    exit 1
fi

# Vérifier si FFmpeg est installé
if ! command -v ffmpeg &> /dev/null; then
    echo "⚠️  FFmpeg n'est pas installé. Veuillez l'installer :"
    echo "   macOS: brew install ffmpeg"
    echo "   Ubuntu/Debian: sudo apt install ffmpeg"
    echo "   Windows: https://ffmpeg.org/download.html"
    echo ""
    echo "L'application peut fonctionner sans FFmpeg, mais vous ne pourrez pas créer de vidéos avec sous-titres."
fi

# Vérifier si Ollama est en cours d'exécution
if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
    echo "⚠️  Ollama n'est pas en cours d'exécution. Veuillez le démarrer :"
    echo "   ollama serve"
    echo ""
    echo "L'application peut fonctionner sans Ollama, mais la transcription et traduction ne seront pas disponibles."
fi

# Vérifier si Whisper local est installé
if ! command -v whisper &> /dev/null; then
    echo "⚠️  Whisper local n'est pas installé. Pour l'installer :"
    echo "   ./install-whisper-local.sh"
    echo "   ou"
    echo "   brew install openai-whisper"
    echo ""
fi

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp env.example .env
    echo "⚠️  Veuillez configurer votre clé API OpenAI dans le fichier .env"
    echo "   Ouvrez le fichier .env et remplacez 'your_openai_api_key_here' par votre clé API"
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Démarrer l'application
echo "🚀 Démarrage du serveur..."
echo "📱 L'application sera accessible sur http://localhost:3001"
echo "🛑 Appuyez sur Ctrl+C pour arrêter le serveur"
echo ""

node server.js
