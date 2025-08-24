#!/bin/bash

echo "🚀 Installation de SEIA Translator pour macOS"
echo "=============================================="

# Vérifier si Homebrew est installé
if ! command -v brew &> /dev/null; then
    echo "📦 Installation de Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
else
    echo "✅ Homebrew déjà installé"
fi

# Mettre à jour Homebrew
echo "🔄 Mise à jour de Homebrew..."
brew update

# Installer FFmpeg
echo "🎬 Installation de FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    brew install ffmpeg
    echo "✅ FFmpeg installé"
else
    echo "✅ FFmpeg déjà installé"
fi

# Installer Ollama
echo "🤖 Installation d'Ollama..."
if ! command -v ollama &> /dev/null; then
    brew install ollama
    echo "✅ Ollama installé"
else
    echo "✅ Ollama déjà installé"
fi

# Démarrer Ollama
echo "🚀 Démarrage d'Ollama..."
ollama serve &
OLLAMA_PID=$!

# Attendre qu'Ollama soit prêt
echo "⏳ Attente du démarrage d'Ollama..."
sleep 5

# Installer le modèle llama3.1
echo "📥 Installation du modèle llama3.1..."
ollama pull llama3.1

# Installer Whisper
echo "🎤 Installation de Whisper..."
if ! command -v whisper &> /dev/null; then
    pip3 install openai-whisper
    echo "✅ Whisper installé"
else
    echo "✅ Whisper déjà installé"
fi

# Installer les dépendances Node.js
echo "📦 Installation des dépendances Node.js..."
npm install

# Construire l'application Electron
echo "🔨 Construction de l'application Electron..."
npm run build

echo ""
echo "🎉 Installation terminée !"
echo "=========================="
echo "✅ FFmpeg installé"
echo "✅ Ollama installé avec le modèle llama3.1"
echo "✅ Whisper installé"
echo "✅ Dépendances Node.js installées"
echo ""
echo "Pour démarrer l'application :"
echo "  npm start"
echo ""
echo "Pour créer un package macOS :"
echo "  npm run package"
