# 🎬 Démonstration Privacy IA Local Transcriptor

Ce guide vous montre comment utiliser Privacy IA Local Transcriptor étape par étape.

## 🚀 Démarrage Rapide

### 1. Installation et Configuration
```bash
# Cloner le projet
git clone <repository-url>
cd seia_translateor

# Installer les dépendances
npm install

# Configurer l'environnement
cp env.example .env
# Éditer .env et ajouter votre clé API OpenAI

# Démarrer l'application
npm start
```

### 2. Accès à l'Application
Ouvrez votre navigateur et allez sur : `http://localhost:3001`

## 📹 Exemple d'Utilisation Complète

### Étape 1: Upload de Vidéo
1. **Glissez-déposez** votre fichier vidéo dans la zone d'upload
2. **Formats supportés** : MP4, AVI, MOV, MKV, WEBM, M4V
3. **Taille maximale** : 500MB
4. L'application affichera "Vidéo uploadée avec succès!"

### Étape 2: Transcription
1. **Sélectionnez** la langue source (ex: Français)
2. **Cliquez** sur "Démarrer la Transcription"
3. **Attendez** que la transcription se termine
4. Vous verrez le nombre de segments détectés

### Étape 3: Traduction
1. **Choisissez** la langue cible (ex: Anglais)
2. **Cliquez** sur "Démarrer la Traduction"
3. **Ollama** traduira chaque segment individuellement
4. La traduction utilise Llama 3.1 en local

### Étape 4: Édition des Sous-titres
1. **Modifiez** les traductions dans l'éditeur
2. **Sauvegardez** vos modifications
3. **Chargez** des fichiers SRT existants si nécessaire

### Étape 5: Export
1. **Téléchargez** le fichier SRT
2. **Créez** une vidéo avec sous-titres intégrés
3. **Téléchargez** la vidéo finale

## 🎯 Cas d'Usage Typiques

### Cas 1: Traduction d'une Conférence
```
Vidéo source: conférence_en_français.mp4
Langue source: Français
Langue cible: Anglais
Résultat: conférence_avec_sous_titres_anglais.mp4
```

### Cas 2: Sous-titrage d'un Tutoriel
```
Vidéo source: tutoriel_technique.mp4
Langue source: Anglais
Langue cible: Français
Résultat: tutoriel_avec_sous_titres_français.mp4
```

### Cas 3: Édition de Sous-titres Existants
```
Fichier SRT: film_original.srt
Modifications: Corrections de traduction
Résultat: film_corrigé.srt
```

## 🔧 Configuration Avancée

### Modifier le Modèle Ollama
```bash
# Télécharger un modèle différent
ollama pull mistral

# Modifier la configuration
echo "OLLAMA_MODEL=mistral" >> .env
```

### Personnaliser les Styles de Sous-titres
Dans `server.js`, ligne 280 :
```javascript
.videoFilters(`subtitles='${srtPath}':force_style='FontSize=28,PrimaryColour=&Hffffff,OutlineColour=&H000000,Bold=1,Shadow=1'`)
```

### Optimiser les Performances
```bash
# Utiliser un GPU (si disponible)
export CUDA_VISIBLE_DEVICES=0

# Réduire la taille du modèle
OLLAMA_MODEL=llama3.1:7b
```

## 📊 Métriques de Performance

### Temps de Traitement Typiques
- **Vidéo 5 minutes** : ~2-3 minutes de transcription + 1-2 minutes de traduction
- **Vidéo 30 minutes** : ~10-15 minutes de transcription + 5-10 minutes de traduction
- **Vidéo 2 heures** : ~45-60 minutes de transcription + 20-30 minutes de traduction

### Facteurs de Performance
- **CPU/GPU** : Plus puissant = plus rapide
- **Modèle Ollama** : Plus petit = plus rapide
- **Qualité vidéo** : Plus haute = plus lente
- **Longueur vidéo** : Plus longue = plus lente

## 🐛 Dépannage Courant

### Problème: "Ollama non disponible"
```bash
# Solution
ollama serve
ollama pull llama3.1
```

### Problème: "Erreur FFmpeg"
```bash
# Vérifier l'installation
ffmpeg -version

# Réinstaller si nécessaire
brew install ffmpeg  # macOS
sudo apt install ffmpeg  # Ubuntu
```

### Problème: "Erreur OpenAI"
```bash
# Vérifier la clé API
cat .env | grep OPENAI_API_KEY

# Tester la clé
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.openai.com/v1/models
```

## 🎨 Personnalisation

### Thème Personnalisé
Modifiez `public/styles.css` :
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --background-color: #f8f9fa;
}
```

### Langues Supplémentaires
Ajoutez dans `public/index.html` :
```html
<option value="ar">Arabe</option>
<option value="hi">Hindi</option>
<option value="tr">Turc</option>
```

## 📈 Améliorations Futures

- [ ] Support des sous-titres multilingues
- [ ] Interface de prévisualisation vidéo
- [ ] Synchronisation automatique des sous-titres
- [ ] Export vers d'autres formats (VTT, ASS)
- [ ] Intégration avec d'autres modèles d'IA
- [ ] Support du streaming vidéo
- [ ] Interface d'administration
- [ ] API REST complète

## 🤝 Support

Pour toute question ou problème :
1. Consultez le README.md
2. Vérifiez les issues GitHub
3. Créez une nouvelle issue avec les détails

---

**Privacy IA Local Transcriptor** - Rendez vos vidéos accessibles à tous ! 🌍✨
