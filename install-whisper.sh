#!/bin/bash

# Script d'installation de Whisper pour Privacy IA Local Transcriptor
echo "🎤 Installation de Whisper pour Privacy IA Local Transcriptor..."
echo ""

# Vérifier si Ollama est installé
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama n'est pas installé."
    echo "   Veuillez l'installer depuis https://ollama.ai"
    echo "   Puis relancez ce script."
    exit 1
fi

# Vérifier si Ollama est en cours d'exécution
if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
    echo "⚠️  Ollama n'est pas en cours d'exécution."
    echo "   Démarrage d'Ollama..."
    ollama serve &
    sleep 5
fi

echo "📦 Téléchargement des modèles Whisper..."

# Télécharger Whisper de base
echo "   📥 Téléchargement de whisper (modèle de base)..."
ollama pull whisper

# Télécharger Whisper optimisé pour le français
echo "   📥 Téléchargement de whisper-french (optimisé français)..."
ollama pull whisper-french

# Télécharger Llama pour la traduction
echo "   📥 Téléchargement de llama3.1 (traduction)..."
ollama pull llama3.1

echo ""
echo "✅ Installation terminée !"
echo ""
echo "📋 Modèles disponibles :"
ollama list
echo ""
echo "🧪 Test de Whisper :"
echo "ollama run whisper 'test de transcription'"
echo ""
echo "🚀 Vous pouvez maintenant démarrer Privacy IA Local Transcriptor :"
echo "   npm start"