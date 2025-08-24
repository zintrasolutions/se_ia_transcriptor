# 🎤 Configuration Whisper Local

Ce guide vous explique comment configurer Whisper local pour la transcription sans avoir besoin d'OpenAI.

## 🚀 Installation de Whisper Local

### 1. Prérequis
- **macOS** avec Homebrew installé
- **Linux** avec apt/yum
- **Windows** avec WSL ou directement

### 2. Installation via Homebrew (macOS)
```bash
# Installation automatique
./install-whisper-local.sh

# Ou installation manuelle
brew install openai-whisper
```

### 3. Installation sur Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg
pip install openai-whisper

# CentOS/RHEL
sudo yum install ffmpeg
pip install openai-whisper
```

### 4. Installation sur Windows
```bash
# Via WSL
sudo apt update
sudo apt install ffmpeg
pip install openai-whisper

# Ou directement sur Windows
# Télécharger FFmpeg depuis https://ffmpeg.org/download.html
pip install openai-whisper
```

## ⚙️ Configuration

### 1. Modifier le fichier .env
```env
# Désactiver OpenAI (optionnel)
# OPENAI_API_KEY=

# Configuration Whisper local
WHISPER_MODEL=base
WHISPER_LANGUAGE=fr
```

### 2. Vérifier l'installation
```bash
# Tester Whisper
whisper --help

# Tester avec un fichier audio
whisper test.mp3 --model base --language fr
```

## 🎯 Utilisation

### Transcription automatique
L'application utilisera automatiquement Whisper local si :
1. Whisper est installé et accessible via `whisper` command
2. OpenAI n'est pas configuré ou échoue

### Fallback vers OpenAI
Si Whisper local échoue et qu'OpenAI est configuré, l'application utilisera automatiquement OpenAI comme fallback.

## 📊 Modèles Whisper Disponibles

| Modèle | Taille | Vitesse | Qualité | Recommandation |
|--------|--------|---------|---------|----------------|
| tiny | ~39 MB | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⚠️ Tests rapides |
| base | ~74 MB | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ Recommandé |
| small | ~244 MB | ⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Bonne qualité |
| medium | ~769 MB | ⭐⭐ | ⭐⭐⭐⭐⭐ | 💾 Qualité élevée |
| large | ~1550 MB | ⭐ | ⭐⭐⭐⭐⭐ | 🐌 Maximum qualité |

## 🔧 Optimisations

### Performance
```bash
# Utiliser un modèle plus petit pour la vitesse
WHISPER_MODEL=tiny

# Utiliser un GPU (si disponible)
export CUDA_VISIBLE_DEVICES=0
```

### Qualité
```bash
# Modèle plus précis
WHISPER_MODEL=medium

# Langue spécifique
WHISPER_LANGUAGE=fr
```

## 🐛 Dépannage

### Whisper non trouvé
```bash
# Vérifier l'installation
which whisper

# Réinstaller si nécessaire
brew install openai-whisper
```

### Erreur de transcription
```bash
# Vérifier que FFmpeg est installé
ffmpeg -version

# Tester Whisper manuellement
whisper test.mp3 --model base
```

### Performance lente
- Utilisez un modèle plus petit
- Vérifiez l'utilisation CPU/GPU
- Fermez les autres applications

## 📝 Notes Importantes

### Avantages de Whisper Local
- ✅ **Aucun coût** : Transcription gratuite
- ✅ **Confidentialité** : Données restent locales
- ✅ **Pas de limite** : Aucune restriction d'usage
- ✅ **Hors ligne** : Fonctionne sans internet
- ✅ **Modèles multiples** : Choix selon les besoins

### Limitations
- ⚠️ **Performance** : Plus lent qu'OpenAI
- ⚠️ **Qualité** : Peut être moins précise
- ⚠️ **Ressources** : Nécessite plus de RAM/CPU
- ⚠️ **Installation** : Plus complexe qu'OpenAI

### Recommandations
- Utilisez `base` pour un bon compromis
- Utilisez `tiny` pour les tests rapides
- Utilisez `medium` pour la production
- Configurez les deux pour un fallback automatique

## 🔄 Migration depuis OpenAI

### 1. Sauvegarder la configuration actuelle
```bash
cp .env .env.backup
```

### 2. Modifier la configuration
```env
# Commenter ou supprimer OpenAI
# OPENAI_API_KEY=your_key_here

# Activer Whisper local
WHISPER_MODEL=base
WHISPER_LANGUAGE=fr
```

### 3. Tester la transcription
- Uploader une vidéo courte
- Vérifier que la transcription fonctionne
- Comparer la qualité avec OpenAI

## 📈 Métriques

### Temps de transcription (vidéo 5 minutes)
- **Whisper tiny** : ~30-60 secondes
- **Whisper base** : ~1-2 minutes
- **Whisper medium** : ~2-3 minutes
- **OpenAI Whisper** : ~30-60 secondes

### Qualité de transcription
- **Whisper tiny** : 70-80% de précision
- **Whisper base** : 85-90% de précision
- **Whisper medium** : 90-95% de précision
- **OpenAI Whisper** : 95-98% de précision

### Coût
- **Whisper local** : 0€
- **OpenAI Whisper** : ~0.006€/minute

## 🎨 Personnalisation

### Modèles personnalisés
```bash
# Télécharger un modèle spécifique
whisper --model large test.mp3

# Utiliser un répertoire de modèles personnalisé
export WHISPER_MODEL_DIR=/path/to/models
```

### Paramètres avancés
```bash
# Transcription avec timestamps détaillés
whisper test.mp3 --word_timestamps True

# Traduction (pas transcription)
whisper test.mp3 --task translate
```

## 🔮 Évolutions Futures

### Améliorations Prévues
- [ ] Support GPU optimisé
- [ ] Modèles quantifiés
- [ ] Interface de comparaison qualité
- [ ] Métriques de performance
- [ ] Cache de transcription

### Intégrations Possibles
- [ ] Whisper.cpp pour plus de performance
- [ ] Modèles multilingues spécialisés
- [ ] API REST pour Whisper local
- [ ] Interface web pour gestion modèles

---

**Whisper Local** - Transcription gratuite et confidentielle ! 🎤✨
