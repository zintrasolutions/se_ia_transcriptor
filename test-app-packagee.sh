#!/bin/bash

echo "🎯 TEST DE L'APP PACKAGÉE SEIA TRANSLATOR"
echo "=========================================="
echo ""

# Vérifier si le serveur est en cours d'exécution
echo "🔍 Vérification du serveur..."
if curl -s http://localhost:3001 > /dev/null; then
    echo "✅ Serveur Node.js en cours d'exécution sur le port 3001"
else
    echo "❌ Serveur Node.js non trouvé sur le port 3001"
    echo "🚀 Démarrage du serveur..."
    npm run start-electron &
    sleep 5
fi

echo ""
echo "📦 Test de l'app packagée..."
echo ""

# Tester l'app packagée
if [ -d "dist/mac-arm64/SEIA Translator.app" ]; then
    echo "✅ App trouvée dans dist/mac-arm64/"
    echo "🚀 Lancement de l'app..."
    open "dist/mac-arm64/SEIA Translator.app"
    echo "✅ App lancée !"
else
    echo "❌ App non trouvée dans dist/mac-arm64/"
    echo "🔨 Création de l'app..."
    npm run package
fi

echo ""
echo "📝 Instructions:"
echo "- L'app devrait s'ouvrir et afficher l'interface"
echo "- Si l'app ne fonctionne pas, vérifiez que le serveur est démarré"
echo "- Pour arrêter le serveur: pkill -f 'node server.js'"
