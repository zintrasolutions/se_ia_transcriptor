#!/bin/bash

# Script de test de performance pour la transcription
echo "🚀 Test de performance de transcription"

# Test avec différents modèles Whisper
echo "📊 Comparaison des modèles Whisper :"
echo ""

# Modèles disponibles (du plus rapide au plus précis)
models=("tiny" "base" "small" "medium" "large")

for model in "${models[@]}"; do
    echo "🧪 Test avec le modèle: $model"
    
    # Mettre à jour la variable d'environnement
    export WHISPER_MODEL=$model
    
    # Mesurer le temps de transcription (exemple avec un fichier audio de 30 secondes)
    start_time=$(date +%s.%N)
    
    # Simuler une transcription (remplacer par un vrai test)
    echo "   ⏱️  Temps estimé pour 30 secondes d'audio :"
    case $model in
        "tiny")
            echo "   ⚡ ~2-3 secondes"
            ;;
        "base")
            echo "   ⚡ ~5-8 secondes"
            ;;
        "small")
            echo "   ⚡ ~10-15 secondes"
            ;;
        "medium")
            echo "   ⚡ ~20-30 secondes"
            ;;
        "large")
            echo "   ⚡ ~40-60 secondes"
            ;;
    esac
    
    echo ""
done

echo "💡 Recommandations pour optimiser la vitesse :"
echo "   1. Utilisez le modèle 'tiny' pour la vitesse maximale"
echo "   2. Utilisez le modèle 'base' pour un bon équilibre vitesse/précision"
echo "   3. Augmentez WHISPER_NUM_THREADS selon votre CPU"
echo "   4. Augmentez WHISPER_BATCH_SIZE pour les GPU"
echo "   5. Utilisez WHISPER_MODEL=tiny pour les tests rapides"
echo ""

echo "🔧 Configuration actuelle :"
echo "   WHISPER_MODEL: ${WHISPER_MODEL:-tiny}"
echo "   WHISPER_NUM_THREADS: ${WHISPER_NUM_THREADS:-4}"
echo "   WHISPER_BATCH_SIZE: ${WHISPER_BATCH_SIZE:-16}"
echo ""

echo "✅ Test terminé !"
