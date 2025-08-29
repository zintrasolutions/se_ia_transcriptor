#!/bin/bash

# Script pour appliquer différents profils de performance
# Usage: ./apply-performance-profile.sh [rapide|equilibre|precis]

set -e

PROFILE=${1:-rapide}

echo "🚀 Application du profil de performance: $PROFILE"

case $PROFILE in
    "rapide"|"fast")
        echo "⚡ Configuration RAPIDE (vitesse maximale)"
        cat > .env << EOF
# Profil RAPIDE - Vitesse maximale
WHISPER_MODEL=tiny
WHISPER_NUM_THREADS=4
WHISPER_BATCH_SIZE=16
WHISPER_LANGUAGE=en
UV_THREADPOOL_SIZE=16
NODE_OPTIONS=--max-old-space-size=4096
EOF
        ;;
    "equilibre"|"balanced")
        echo "⚖️  Configuration ÉQUILIBRÉE (bon compromis)"
        cat > .env << EOF
# Profil ÉQUILIBRÉ - Bon compromis vitesse/précision
WHISPER_MODEL=base
WHISPER_NUM_THREADS=6
WHISPER_BATCH_SIZE=24
WHISPER_LANGUAGE=en
UV_THREADPOOL_SIZE=16
NODE_OPTIONS=--max-old-space-size=4096
EOF
        ;;
    "precis"|"precise")
        echo "🎯 Configuration PRÉCISE (qualité maximale)"
        cat > .env << EOF
# Profil PRÉCIS - Qualité maximale
WHISPER_MODEL=large
WHISPER_NUM_THREADS=8
WHISPER_BATCH_SIZE=32
WHISPER_LANGUAGE=en
UV_THREADPOOL_SIZE=16
NODE_OPTIONS=--max-old-space-size=8192
EOF
        ;;
    *)
        echo "❌ Profil non reconnu: $PROFILE"
        echo "Profils disponibles: rapide, equilibre, precis"
        exit 1
        ;;
esac

echo "✅ Configuration appliquée !"
echo "📋 Contenu du fichier .env :"
echo "---"
cat .env
echo "---"

echo ""
echo "🔄 Redémarrage des conteneurs avec la nouvelle configuration..."
docker compose down
docker compose up -d --build

echo ""
echo "🎉 Profil $PROFILE appliqué avec succès !"
echo "📊 L'application est maintenant optimisée pour ce profil."
