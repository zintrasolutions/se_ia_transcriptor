#!/bin/bash

echo "🚀 Démarrage de SEIA Translator avec Electron"
echo "=============================================="

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

# Tuer les processus existants
echo "🧹 Nettoyage des processus existants..."
pkill -f "node.*server.js" 2>/dev/null
pkill -f electron 2>/dev/null

# Attendre que les ports soient libres
sleep 2

# Démarrer le serveur en arrière-plan
echo "🌐 Démarrage du serveur..."
node server.js &
SERVER_PID=$!

# Attendre que le serveur démarre
echo "⏳ Attente du démarrage du serveur..."
sleep 5

# Vérifier que le serveur fonctionne
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Serveur démarré avec succès (PID: $SERVER_PID)"
else
    echo "❌ Le serveur n'a pas démarré correctement"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Démarrer Electron
echo "🎯 Démarrage d'Electron..."
npm run electron

# Nettoyer à la fin
echo "🧹 Nettoyage..."
kill $SERVER_PID 2>/dev/null
