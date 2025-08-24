# 🍎 SEIA Translator - Configuration macOS

## ✅ Configuration terminée !

Votre application SEIA Translator est maintenant configurée pour fonctionner en tant qu'app autonome sur macOS.

## 🚀 Démarrage rapide

### Option 1 : Script automatique (recommandé)
```bash
npm run start-macos
```

### Option 2 : Manuel
```bash
# Vérifier les dépendances
npm run check-deps

# Démarrer l'application
npm run electron
```

## 📦 Créer un package DMG

```bash
# Installer les dépendances de build
npm install

# Créer le package
npm run package:mac
```

Le fichier DMG sera créé dans `dist/SEIA Translator-1.0.0.dmg`

## 🔧 Fonctionnalités ajoutées

### ✅ Vérifications automatiques
- **FFmpeg** : Pour le traitement vidéo
- **Ollama** : Pour l'IA locale
- **Whisper** : Pour la transcription
- **llama3.1** : Modèle de traduction

### ✅ Installation automatique
- Script `install-macos.sh` pour installer toutes les dépendances
- Installation automatique du modèle llama3.1 si Ollama est présent

### ✅ Interface Electron
- Application native macOS
- Menu intégré
- Gestion des fenêtres
- Support des raccourcis clavier

### ✅ Nettoyage automatique
- Nettoyage des dossiers au démarrage
- Suppression des fichiers temporaires
- Gestion de l'espace disque

## 📁 Structure des fichiers

```
seia_translateor/
├── electron-main.js          # Point d'entrée Electron
├── server.js                 # Serveur Express
├── public/                   # Interface utilisateur
├── assets/                   # Ressources (icônes, etc.)
├── scripts/                  # Scripts de build
├── install-macos.sh          # Installation automatique
├── start-macos.sh           # Démarrage rapide
├── check-deps.js            # Vérification des dépendances
├── README-MACOS.md          # Guide d'installation
└── MACOS-SETUP.md           # Ce fichier
```

## 🎯 Utilisation

1. **Upload** : Glissez-déposez votre vidéo
2. **Transcription** : Sélectionnez la langue source
3. **Traduction** : Choisissez la langue cible
4. **Export** : Téléchargez les sous-titres ou la vidéo avec sous-titres

## 🔒 Sécurité

- ✅ Traitement 100% local
- ✅ Aucune donnée envoyée en ligne
- ✅ Chiffrement des fichiers temporaires
- ✅ Nettoyage automatique

## 🐛 Dépannage

### Problèmes courants

#### 1. "Dependencies missing"
```bash
npm run install-macos
```

#### 2. "Port 3001 already in use"
```bash
lsof -ti:3001 | xargs kill -9
```

#### 3. "Ollama not responding"
```bash
pkill ollama
ollama serve &
```

#### 4. "FFmpeg not found"
```bash
brew install ffmpeg
```

### Logs et débogage

```bash
# Mode développement
NODE_ENV=development npm run electron

# Vérifier les processus
ps aux | grep -E "(node|ollama|electron)"
```

## 📞 Support

- **Documentation** : `README-MACOS.md`
- **Vérification** : `npm run check-deps`
- **Installation** : `npm run install-macos`
- **Démarrage** : `npm run start-macos`

---

**SEIA Translator** - Application autonome pour macOS  
*Transcription et traduction de vidéos avec sous-titres*
