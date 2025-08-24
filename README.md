# Privacy IA Local Transcriptor

Une application web complète pour la transcription et traduction de vidéos avec sous-titres, utilisant OpenAI Whisper pour la transcription et Ollama/Llama 3.1 pour la traduction.

## 🚀 Fonctionnalités

- **Upload de vidéos** : Support des formats MP4, AVI, MOV, MKV, WEBM, M4V (max 500MB)
- **Détection automatique de langue** : Transcription avec OpenAI Whisper
- **Traduction locale** : Utilisation d'Ollama avec Llama 3.1 pour la traduction
- **Édition des sous-titres** : Interface intuitive pour modifier les traductions
- **Export multiple** : Fichiers SRT et vidéos avec sous-titres intégrés
- **Gestion des fichiers** : Sauvegarde et chargement de projets SRT
- **Interface moderne** : Design responsive et intuitif

## 📋 Prérequis

- **Node.js** (version 16 ou supérieure)
- **FFmpeg** installé sur votre système
- **Ollama** installé et configuré avec Llama 3.1
- **Whisper local** (optionnel, via Ollama) ou **Clé API OpenAI** pour la transcription

### Installation de FFmpeg

#### macOS
```bash
brew install ffmpeg
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

#### Windows
Téléchargez depuis [le site officiel de FFmpeg](https://ffmpeg.org/download.html)

### Installation d'Ollama

Suivez les instructions sur [ollama.ai](https://ollama.ai) pour installer Ollama, puis téléchargez les modèles nécessaires :

```bash
# Modèle de traduction
ollama pull llama3.1

# Modèle de transcription (optionnel, pour éviter OpenAI)
ollama pull whisper
```

## 🛠️ Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd seia_translateor
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration des variables d'environnement**
Créez un fichier `.env` à la racine du projet :
```env
# Optionnel : Clé API OpenAI pour la transcription
OPENAI_API_KEY=votre_clé_api_openai_ici

# Configuration Ollama
OLLAMA_MODEL=llama3.1
WHISPER_MODEL=whisper

PORT=3001
```

4. **Démarrer l'application**
```bash
npm start
```

L'application sera accessible sur `http://localhost:3001`

## 🎯 Utilisation

### 1. Upload de Vidéo
- Glissez-déposez votre fichier vidéo dans la zone d'upload
- Ou cliquez pour sélectionner un fichier
- Formats supportés : MP4, AVI, MOV, MKV, WEBM, M4V
- Taille maximale : 500MB

### 2. Transcription
- Sélectionnez la langue source de votre vidéo
- Cliquez sur "Démarrer la Transcription"
- La transcription utilise OpenAI Whisper pour une précision optimale
- Les segments sont automatiquement synchronisés avec les timecodes

### 3. Traduction
- Choisissez la langue cible pour la traduction
- Cliquez sur "Démarrer la Traduction"
- La traduction utilise Ollama avec Llama 3.1 en local
- Chaque segment est traduit individuellement

### 4. Édition des Sous-titres
- Modifiez les traductions dans l'éditeur en temps réel
- Sauvegardez vos modifications
- Chargez des fichiers SRT existants pour les modifier

### 5. Export
- **Fichier SRT** : Téléchargez le fichier de sous-titres
- **Vidéo avec sous-titres** : Créez une vidéo avec les sous-titres intégrés
- Les fichiers sont sauvegardés localement pour un accès ultérieur

## 📁 Structure du Projet

```
seia_translateor/
├── server.js              # Serveur Express principal
├── package.json           # Dépendances et scripts
├── README.md             # Documentation
├── public/               # Interface utilisateur
│   ├── index.html        # Page principale
│   ├── styles.css        # Styles CSS
│   └── script.js         # Logique JavaScript
├── uploads/              # Vidéos uploadées (créé automatiquement)
├── subtitles/            # Fichiers SRT (créé automatiquement)
└── output/               # Vidéos avec sous-titres (créé automatiquement)
```

## 🔧 Configuration Avancée

### Modifier le modèle Ollama
Dans `server.js`, ligne 175, vous pouvez changer le modèle :
```javascript
model: 'llama3.1'  // Changez pour un autre modèle disponible
```

### Ajuster les paramètres de transcription
Dans `server.js`, vous pouvez modifier les paramètres OpenAI Whisper :
```javascript
const transcript = await openai.audio.transcriptions.create({
  file: audioFile,
  model: "whisper-1",
  language: language || "fr",
  response_format: "verbose_json",
  timestamp_granularities: ["segment"]
});
```

### Personnaliser les styles des sous-titres
Dans `server.js`, ligne 280, modifiez les paramètres FFmpeg :
```javascript
.videoFilters(`subtitles='${srtPath}':force_style='FontSize=24,PrimaryColour=&Hffffff,OutlineColour=&H000000,Bold=1'`)
```

## 🐛 Dépannage

### Ollama non connecté
- Vérifiez qu'Ollama est en cours d'exécution : `ollama serve`
- Vérifiez que le modèle est téléchargé : `ollama list`
- Testez la connexion : `curl http://localhost:11434/api/tags`

### Erreur FFmpeg
- Vérifiez que FFmpeg est installé : `ffmpeg -version`
- Assurez-vous que FFmpeg est dans votre PATH

### Erreur OpenAI
- Vérifiez votre clé API dans le fichier `.env`
- Assurez-vous que votre compte OpenAI a des crédits suffisants

### Problèmes de performance
- Pour les vidéos longues, la transcription peut prendre du temps
- La traduction dépend de la puissance de votre machine
- Considérez l'utilisation d'un GPU pour de meilleures performances

## 🔒 Sécurité

- Les fichiers sont stockés localement sur votre serveur
- Aucune donnée n'est envoyée à des services tiers (sauf OpenAI pour la transcription)
- Les clés API sont stockées dans des variables d'environnement

## 📝 Licence

MIT License - voir le fichier LICENSE pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Soumettre des pull requests

## 📞 Support

Pour toute question ou problème :
1. Consultez la section Dépannage
2. Vérifiez les issues existantes
3. Créez une nouvelle issue avec les détails du problème

---

**Privacy IA Local Transcriptor** - Transcription et traduction vidéo simplifiées 🎬✨
