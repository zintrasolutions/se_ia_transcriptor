#!/bin/bash

echo "🚀 Démarrage de SEIA Translator"
echo "================================"

# Vérifier les dépendances
echo "🔍 Vérification des dépendances..."
npm run check-deps

if [ $? -ne 0 ]; then
    echo "❌ Certaines dépendances manquent."
    echo "Exécutez: npm run install-macos"
    exit 1
fi

# Démarrer Ollama s'il n'est pas déjà en cours
echo "🤖 Vérification d'Ollama..."
if ! pgrep -x "ollama" > /dev/null; then
    echo "🚀 Démarrage d'Ollama..."
    ollama serve &
    sleep 3
else
    echo "✅ Ollama déjà en cours d'exécution"
fi

# Démarrer l'application Electron
echo "🎯 Démarrage de l'application..."
npm run electron
