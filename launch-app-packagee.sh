#!/bin/bash

echo "🚀 LANCEMENT DE L'APP PACKAGÉE SEIA TRANSLATOR"
echo "=============================================="
echo ""

# Vérifier si le serveur est déjà en cours d'exécution
echo "🔍 Vérification du serveur..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Serveur déjà en cours d'exécution sur le port 3001"
else
    echo "❌ Serveur non trouvé, démarrage..."
    
    # Démarrer le serveur en arrière-plan
    echo "🌐 Démarrage du serveur Node.js..."
    node server.js &
    SERVER_PID=$!
    
    # Attendre que le serveur démarre
    echo "⏳ Attente du démarrage du serveur..."
    for i in {1..30}; do
        if curl -s http://localhost:3001 > /dev/null; then
            echo "✅ Serveur démarré avec succès (PID: $SERVER_PID)"
            break
        fi
        sleep 1
    done
    
    if ! curl -s http://localhost:3001 > /dev/null; then
        echo "❌ Impossible de démarrer le serveur"
        exit 1
    fi
fi

echo ""
echo "📦 Lancement de l'app packagée..."

# Vérifier si l'app existe
if [ -d "dist/mac-arm64/SEIA Translator.app" ]; then
    echo "✅ App trouvée dans dist/mac-arm64/"
    echo "🚀 Lancement..."
    open "dist/mac-arm64/SEIA Translator.app"
    echo "✅ App lancée !"
else
    echo "❌ App non trouvée, création..."
    npm run package
    if [ -d "dist/mac-arm64/SEIA Translator.app" ]; then
        echo "✅ App créée, lancement..."
        open "dist/mac-arm64/SEIA Translator.app"
    else
        echo "❌ Échec de la création de l'app"
        exit 1
    fi
fi

echo ""
echo "📝 Instructions:"
echo "- L'app devrait maintenant s'ouvrir et fonctionner"
echo "- Le serveur tourne en arrière-plan sur le port 3001"
echo "- Pour arrêter le serveur: pkill -f 'node server.js'"
echo "- Pour fermer l'app: fermez simplement la fenêtre"
