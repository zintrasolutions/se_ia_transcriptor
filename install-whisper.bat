@echo off
chcp 65001 >nul

echo 🎤 Installation de Whisper pour Privacy IA Local Transcriptor...
echo.

REM Vérifier si Ollama est installé
ollama --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Ollama n'est pas installé.
    echo    Veuillez l'installer depuis https://ollama.ai
    echo    Puis relancez ce script.
    pause
    exit /b 1
)

REM Vérifier si Ollama est en cours d'exécution
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Ollama n'est pas en cours d'exécution.
    echo    Démarrage d'Ollama...
    start /B ollama serve
    timeout /t 5 /nobreak >nul
)

echo 📦 Téléchargement des modèles Whisper...

REM Télécharger Whisper de base
echo    📥 Téléchargement de whisper (modèle de base)...
ollama pull whisper

REM Télécharger Whisper optimisé pour le français
echo    📥 Téléchargement de whisper-french (optimisé français)...
ollama pull whisper-french

REM Télécharger Llama pour la traduction
echo    📥 Téléchargement de llama3.1 (traduction)...
ollama pull llama3.1

echo.
echo ✅ Installation terminée !
echo.
echo 📋 Modèles disponibles :
ollama list
echo.
echo 🧪 Test de Whisper :
echo ollama run whisper "test de transcription"
echo.
echo 🚀 Vous pouvez maintenant démarrer Privacy IA Local Transcriptor :
echo    npm start
pause
