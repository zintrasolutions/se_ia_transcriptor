# Guide d'installation SEIA Translator

## Installation automatique (Recommandée)

1. **Téléchargez l'app** SEIA Translator
2. **Glissez l'app** dans le dossier Applications
3. **Lancez l'app** - elle détectera automatiquement les dépendances manquantes
4. **Cliquez sur "Installer automatiquement"** quand demandé

## Installation manuelle des dépendances

Si l'installation automatique échoue, installez manuellement :

### 1. Homebrew (Requis pour FFmpeg)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. FFmpeg
```bash
brew install ffmpeg
```

### 3. Ollama
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 4. Whisper
```bash
pip3 install openai-whisper
```

### 5. Modèle llama3.1
```bash
ollama pull llama3.1
```

## Vérification des installations

Après installation, vérifiez que tout fonctionne :

```bash
# Vérifier FFmpeg
ffmpeg -version

# Vérifier Ollama
ollama --version

# Vérifier Whisper
whisper --help

# Vérifier le modèle llama3.1
ollama list | grep llama3.1
```

## Dépannage

### Problème : "brew not found"
- **Solution** : Installez Homebrew d'abord
- **Lien** : https://brew.sh

### Problème : "python3 not found"
- **Solution** : Installez Python 3
- **Lien** : https://www.python.org/downloads/

### Problème : "ollama not found"
- **Solution** : Installez Ollama
- **Lien** : https://ollama.ai/download

### Problème : Permissions administrateur
- **Solution** : Lancez Terminal en tant qu'administrateur
- **Commande** : `sudo` devant les commandes d'installation

## Support

Si vous rencontrez des problèmes :

1. **Redémarrez l'app** après installation des dépendances
2. **Vérifiez les logs** dans la console de l'app
3. **Consultez la documentation** de chaque outil

## Versions testées

- **macOS** : 12.0+
- **FFmpeg** : 6.0+
- **Ollama** : 0.1.0+
- **Whisper** : 20231117+
- **Python** : 3.8+
