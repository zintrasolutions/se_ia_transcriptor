#!/bin/bash

# Script d'installation de Whisper local pour Privacy IA Local Transcriptor
echo "🎤 Installation de Whisper local pour Privacy IA Local Transcriptor..."
echo ""

# Vérifier si Homebrew est installé
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew n'est pas installé."
    echo "   Veuillez l'installer depuis https://brew.sh"
    echo "   Puis relancez ce script."
    exit 1
fi

# Vérifier si Whisper est déjà installé
if command -v whisper &> /dev/null; then
    echo "✅ Whisper est déjà installé"
    whisper --version
else
    echo "📦 Installation de Whisper via Homebrew..."
    brew install openai-whisper
fi

# Vérifier l'installation
if command -v whisper &> /dev/null; then
    echo ""
    echo "✅ Whisper installé avec succès!"
    echo "📋 Version:"
    whisper --version
    echo ""
    echo "🧪 Test de Whisper:"
    echo "whisper --help"
    echo ""
    echo "📝 Modèles disponibles:"
    echo "  - tiny: ~39 MB, plus rapide, moins précis"
    echo "  - base: ~74 MB, bon compromis"
    echo "  - small: ~244 MB, plus précis"
    echo "  - medium: ~769 MB, très précis"
    echo "  - large: ~1550 MB, le plus précis"
    echo ""
    echo "🔧 Configuration recommandée dans .env:"
    echo "WHISPER_MODEL=base"
    echo "WHISPER_LANGUAGE=fr"
    echo ""
    echo "🚀 Vous pouvez maintenant démarrer Privacy IA Local Transcriptor :"
    echo "   npm start"
else
    echo "❌ Erreur lors de l'installation de Whisper"
    exit 1
fi
