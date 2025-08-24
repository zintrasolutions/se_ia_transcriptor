#!/bin/bash

echo "🔧 Démarrage forcé d'Electron sur macOS"
echo "========================================"

# Tuer les processus existants
pkill -f electron 2>/dev/null

# Attendre
sleep 2

# Démarrer Electron avec des paramètres spécifiques pour macOS
echo "🚀 Démarrage d'Electron..."
ELECTRON_ENABLE_LOGGING=1 ELECTRON_ENABLE_STACK_DUMPING=1 ./node_modules/.bin/electron basic-electron.js &

# Attendre qu'Electron démarre
sleep 3

# Forcer l'activation
echo "🎯 Activation forcée..."
osascript -e 'tell application "Electron" to activate'

# Attendre
sleep 2

# Vérifier les processus
echo "📊 Vérification des processus..."
ps aux | grep -E "(electron)" | grep -v grep

echo "✅ Script terminé. Vérifiez votre écran et le dock."
