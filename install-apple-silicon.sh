#!/bin/bash

echo "🚀 Installation de SEIA Translator pour Apple Silicon"
echo "====================================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si on est sur macOS Apple Silicon
if [[ "$OSTYPE" != "darwin"* ]]; then
    print_error "Ce script est conçu pour macOS uniquement"
    exit 1
fi

# Vérifier l'architecture
if [[ $(uname -m) != "arm64" ]]; then
    print_error "Ce script est conçu pour Apple Silicon (ARM64) uniquement"
    exit 1
fi

print_success "Architecture Apple Silicon détectée"

# Demander confirmation
echo ""
echo "Ce script va installer :"
echo "  • Homebrew"
echo "  • FFmpeg"
echo "  • Ollama"
echo "  • Modèle llama3.1"
echo "  • Whisper"
echo "  • SEIA Translator"
echo ""
read -p "Continuer ? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Installation annulée"
    exit 0
fi

print_status "Début de l'installation..."

# 1. Installer Homebrew si pas présent
if ! command -v brew &> /dev/null; then
    print_status "Installation de Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Ajouter Homebrew au PATH pour Apple Silicon
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
    print_success "Homebrew installé"
else
    print_success "Homebrew déjà installé"
fi

# 2. Installer FFmpeg
print_status "Installation de FFmpeg..."
if ! command -v ffmpeg &> /dev/null; then
    /opt/homebrew/bin/brew install ffmpeg
    print_success "FFmpeg installé"
else
    print_success "FFmpeg déjà installé"
fi

# 3. Installer Ollama
print_status "Installation d'Ollama..."
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.ai/install.sh | sh
    print_success "Ollama installé"
else
    print_success "Ollama déjà installé"
fi

# 4. Démarrer Ollama et installer le modèle llama3.1
print_status "Démarrage d'Ollama et installation du modèle llama3.1..."
if ! pgrep -x "ollama" > /dev/null; then
    ollama serve &
    sleep 5
fi

if ! ollama list | grep -q "llama3.1"; then
    print_status "Téléchargement du modèle llama3.1 (cela peut prendre plusieurs minutes)..."
    ollama pull llama3.1
    print_success "Modèle llama3.1 installé"
else
    print_success "Modèle llama3.1 déjà installé"
fi

# 5. Installer Whisper
print_status "Installation de Whisper..."
if ! command -v whisper &> /dev/null; then
    pip3 install openai-whisper
    print_success "Whisper installé"
else
    print_success "Whisper déjà installé"
fi

# 6. Vérifier Node.js
print_status "Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    print_status "Installation de Node.js..."
    /opt/homebrew/bin/brew install node
    print_success "Node.js installé"
else
    print_success "Node.js déjà installé"
fi

# 7. Construire l'app SEIA Translator
print_status "Construction de l'application SEIA Translator..."
if [ -f "package.json" ]; then
    npm install
    npm run package
    print_success "Application construite"
else
    print_error "package.json non trouvé. Assurez-vous d'être dans le bon répertoire."
    exit 1
fi

# 8. Installation finale
print_status "Installation de l'application..."
if [ -d "dist/mac-arm64" ]; then
    print_success "App créée : dist/mac-arm64/SEIA Translator.app"
    
    # Copier dans Applications
    read -p "Copier l'app dans le dossier Applications ? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp -R "dist/mac-arm64/SEIA Translator.app" /Applications/
        print_success "SEIA Translator installé dans /Applications/"
    fi
    
    print_status "Vous pouvez maintenant lancer SEIA Translator depuis le dossier Applications"
else
    print_warning "App non trouvée. Vérifiez le dossier dist/"
fi

echo ""
print_success "Installation terminée !"
echo ""
echo "Toutes les dépendances sont maintenant installées et configurées !"
echo "Lancez SEIA Translator depuis le dossier Applications."
