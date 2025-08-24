# SEIA Translator - Guide d'installation macOS

## 🚀 Installation rapide

### Option 1 : Installation automatique (recommandée)

```bash
# Cloner le repository
git clone <repository-url>
cd seia_translateor

# Installation automatique de toutes les dépendances
npm run install-macos
```

### Option 2 : Installation manuelle

#### 1. Prérequis

- **macOS 10.15 ou plus récent**
- **Homebrew** (gestionnaire de paquets pour macOS)
- **Python 3.8+** (pour Whisper)

#### 2. Installer Homebrew (si pas déjà installé)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### 3. Installer les dépendances

```bash
# Mettre à jour Homebrew
brew update

# Installer FFmpeg
brew install ffmpeg

# Installer Ollama
brew install ollama

# Démarrer Ollama
ollama serve &

# Installer le modèle llama3.1
ollama pull llama3.1

# Installer Whisper
pip3 install openai-whisper
```

#### 4. Installer les dépendances Node.js

```bash
npm install
```

## 🎯 Utilisation

### Démarrer l'application

```bash
# Mode serveur web uniquement
npm start

# Mode application Electron (recommandé)
npm run electron
```

### Vérifier les dépendances

```bash
npm run check-deps
```

## 📦 Créer un package macOS

```bash
# Créer un package DMG
npm run package:mac
```

Le fichier DMG sera créé dans le dossier `dist/`.

## 🔧 Dépannage

### Problèmes courants

#### 1. FFmpeg non trouvé
```bash
brew install ffmpeg
```

#### 2. Ollama non trouvé
```bash
brew install ollama
ollama serve &
```

#### 3. Whisper non trouvé
```bash
pip3 install openai-whisper
```

#### 4. Modèle llama3.1 manquant
```bash
ollama pull llama3.1
```

#### 5. Port 3001 déjà utilisé
```bash
# Trouver le processus qui utilise le port
lsof -ti:3001

# Tuer le processus
kill -9 <PID>
```

### Vérification complète

```bash
# Vérifier toutes les dépendances
npm run check-deps

# Vérifier la version de Node.js
node --version

# Vérifier FFmpeg
ffmpeg -version

# Vérifier Ollama
ollama --version

# Vérifier Whisper
whisper --help

# Vérifier les modèles Ollama
ollama list
```

## 📁 Structure de l'application

```
seia_translateor/
├── electron-main.js      # Point d'entrée Electron
├── server.js             # Serveur Express
├── public/               # Interface utilisateur
├── uploads/              # Vidéos uploadées
├── output/               # Vidéos avec sous-titres
├── subtitles/            # Fichiers SRT
├── install-macos.sh      # Script d'installation
└── package.json          # Configuration
```

## 🎨 Fonctionnalités

- ✅ **Transcription automatique** avec Whisper
- ✅ **Traduction** avec Ollama + llama3.1
- ✅ **Sous-titres SRT** exportables
- ✅ **Vidéo avec sous-titres intégrés**
- ✅ **Interface moderne** et intuitive
- ✅ **Traitement local** (pas de données envoyées en ligne)

## 🔒 Sécurité

- Toutes les données sont traitées localement
- Aucune donnée n'est envoyée à des services externes
- Les fichiers temporaires sont automatiquement nettoyés

## 📞 Support

En cas de problème, vérifiez :
1. Que toutes les dépendances sont installées
2. Les logs dans la console
3. Que les ports ne sont pas bloqués par le pare-feu

---

**SEIA Translator** - Transcription et traduction de vidéos avec sous-titres
