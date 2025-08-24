# Modèles Ollama Supportés

Privacy IA Local Transcriptor utilise Ollama pour la traduction locale. Voici les modèles recommandés et comment les configurer.

## 🚀 Modèles Recommandés

### 1. Llama 2 (Recommandé)
```bash
ollama pull llama3.1
```
- **Taille** : ~3.8GB
- **Performance** : Excellente pour la traduction
- **Langues** : Multilingue
- **Configuration** : `OLLAMA_MODEL=llama3.1`

### 2. Llama 2 7B Chat
```bash
ollama pull llama3.1:7b-chat
```
- **Taille** : ~4GB
- **Performance** : Optimisé pour les conversations
- **Langues** : Multilingue
- **Configuration** : `OLLAMA_MODEL=llama3.1:7b-chat`

### 3. Mistral 7B
```bash
ollama pull mistral
```
- **Taille** : ~4.1GB
- **Performance** : Très bonne pour la traduction
- **Langues** : Multilingue
- **Configuration** : `OLLAMA_MODEL=mistral`

### 4. Code Llama
```bash
ollama pull codellama
```
- **Taille** : ~3.8GB
- **Performance** : Spécialisé pour le code, mais bon pour la traduction
- **Langues** : Multilingue
- **Configuration** : `OLLAMA_MODEL=codellama`

## 🔧 Configuration

### 1. Modifier le fichier .env
```env
OLLAMA_MODEL=llama3.1
OLLAMA_BASE_URL=http://localhost:11434
```

### 2. Modifier directement dans server.js
```javascript
const OLLAMA_MODEL = 'llama3.1'; // Changez ici
```

## 📊 Comparaison des Modèles

| Modèle | Taille | Vitesse | Qualité | Recommandation |
|--------|--------|---------|---------|----------------|
| llama3.1 | 3.8GB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Recommandé |
| llama3.1:7b-chat | 4GB | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Recommandé |
| mistral | 4.1GB | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ Recommandé |
| codellama | 3.8GB | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⚠️ Spécialisé |
| llama3.1:13b | 7.3GB | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 💾 Plus lent |
| llama3.1:70b | 39GB | ⭐⭐ | ⭐⭐⭐⭐⭐ | 🐌 Très lent |

## 🎯 Optimisations

### Pour de meilleures performances :
1. **Utilisez un GPU** si disponible
2. **Choisissez un modèle plus petit** pour la vitesse
3. **Ajustez les paramètres** dans le code

### Paramètres de traduction personnalisés :
```javascript
// Dans server.js, modifiez le prompt
const prompt = `Traduis le texte suivant de ${sourceLanguage} vers ${targetLanguage}. 
Garde le même style et ton. Retourne seulement la traduction sans explications:

"${segment.text}"`;
```

## 🔍 Dépannage

### Modèle non trouvé
```bash
# Lister les modèles disponibles
ollama list

# Télécharger un modèle
ollama pull llama3.1

# Vérifier l'espace disque
df -h
```

### Performance lente
- Utilisez un modèle plus petit
- Vérifiez l'utilisation CPU/GPU
- Fermez les autres applications

### Erreurs de traduction
- Vérifiez que le modèle supporte les langues
- Essayez un modèle différent
- Vérifiez la qualité du texte source

## 📝 Notes

- Les modèles plus grands donnent de meilleures traductions mais sont plus lents
- Les modèles spécialisés (comme Code Llama) peuvent être moins bons pour la traduction générale
- Llama 2 est généralement le meilleur compromis qualité/vitesse
- Mistral est excellent pour les langues européennes
