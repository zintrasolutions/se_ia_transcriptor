@echo off
chcp 65001 >nul

echo 🎬 Privacy IA Local Transcriptor - Démarrage de l'application...

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé. Veuillez l'installer depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier si FFmpeg est installé
ffmpeg -version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  FFmpeg n'est pas installé. Veuillez l'installer depuis https://ffmpeg.org/download.html
    echo.
    echo L'application peut fonctionner sans FFmpeg, mais vous ne pourrez pas créer de vidéos avec sous-titres.
    echo.
)

REM Vérifier si le fichier .env existe
if not exist .env (
    echo 📝 Création du fichier .env...
    copy env.example .env
    echo ⚠️  Veuillez configurer votre clé API OpenAI dans le fichier .env
    echo    Ouvrez le fichier .env et remplacez 'your_openai_api_key_here' par votre clé API
    echo.
)

REM Installer les dépendances si nécessaire
if not exist node_modules (
    echo 📦 Installation des dépendances...
    npm install
)

REM Démarrer l'application
echo 🚀 Démarrage du serveur...
echo 📱 L'application sera accessible sur http://localhost:3001
echo 🛑 Appuyez sur Ctrl+C pour arrêter le serveur
echo.

node server.js
