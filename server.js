const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3001;

// Configuration
app.use(cors());
app.use(express.json());

// Déterminer le chemin du dossier public selon l'environnement
const publicPath = path.join(__dirname, 'public');
console.log(`📁 Chemin du dossier public: ${publicPath}`);
app.use(express.static(publicPath));

// Enrichir le PATH système pour accéder aux outils externes
const systemPaths = [
    '/opt/homebrew/bin',  // Homebrew sur Apple Silicon
    '/usr/local/bin',     // Homebrew sur Intel
    '/usr/bin',           // Système
    '/bin',               // Système
    '/Library/Frameworks/Python.framework/Versions/3.12/bin'  // Python framework (Whisper)
];

// Ajouter les chemins système au PATH si pas déjà présents
systemPaths.forEach(systemPath => {
    if (fs.existsSync(systemPath) && !process.env.PATH.includes(systemPath)) {
        process.env.PATH = `${systemPath}:${process.env.PATH}`;
    }
});

// En mode packagé, forcer l'utilisation du PATH système
if (process.env.NODE_ENV === 'production' || process.resourcesPath) {
    console.log('📦 Mode packagé détecté, utilisation du PATH système...');
    // Récupérer le PATH système depuis l'environnement utilisateur
    const { execSync } = require('child_process');
    try {
        const systemPath = execSync('echo $PATH', { shell: '/bin/zsh' }).toString().trim();
        process.env.PATH = systemPath;
        console.log('🔧 PATH système forcé:', process.env.PATH);
    } catch (error) {
        console.log('⚠️ Impossible de récupérer le PATH système:', error.message);
    }
}

console.log('🔍 PATH système enrichi:', process.env.PATH);

// Configuration OpenAI (optionnel, pour la transcription)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

// Configuration Ollama
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1';

// Configuration Whisper local
const WHISPER_MODEL = process.env.WHISPER_MODEL || 'base';
const WHISPER_LANGUAGE = process.env.WHISPER_LANGUAGE || 'en';

// Fonction pour nettoyer les noms de fichiers
function sanitizeFilename(filename) {
  return filename
    .replace(/[<>:"/\\|?*]/g, '') // Supprimer les caractères invalides
    .replace(/[®©™]/g, '') // Supprimer les symboles de marque
    .replace(/\s+/g, '_') // Remplacer les espaces par des underscores
    .replace(/[^\w\-_.]/g, '') // Garder seulement les caractères alphanumériques, tirets, points et underscores
    .replace(/^\.+|\.+$/g, '') // Supprimer les points au début et à la fin
    .replace(/\.{2,}/g, '.') // Remplacer les points multiples par un seul point
    .substring(0, 200) // Limiter la longueur
    .replace(/\.$/, '') // Supprimer le point final s'il reste
    || 'video_output'; // Nom par défaut si le résultat est vide
}

// Configuration des dossiers
const uploadsDir = path.join(__dirname, 'uploads');
const subtitlesDir = path.join(__dirname, 'subtitles');
const outputDir = path.join(__dirname, 'output');

// Créer les dossiers s'ils n'existent pas
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(subtitlesDir);
fs.ensureDirSync(outputDir);

// Nettoyer les dossiers au démarrage
console.log('🧹 Nettoyage des dossiers subtitles, output et uploads...');
try {
  // Nettoyer le dossier uploads (garder seulement les vidéos récentes)
  const uploadFiles = fs.readdirSync(uploadsDir);
  uploadFiles.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const stats = fs.statSync(filePath);
    const fileAge = Date.now() - stats.mtime.getTime();
    const oneHour = 60 * 60 * 1000; // 1 heure en millisecondes
    
    // Supprimer les fichiers temporaires et les vidéos de plus d'1 heure
    if (file.endsWith('.mp3') || file.endsWith('.json') || fileAge > oneHour) {
      fs.removeSync(filePath);
      console.log(`🗑️ Supprimé: ${file}`);
    }
  });
  
  // Nettoyer le dossier output (garder seulement les vidéos avec sous-titres récentes)
  const outputFiles = fs.readdirSync(outputDir);
  outputFiles.forEach(file => {
    const filePath = path.join(outputDir, file);
    const stats = fs.statSync(filePath);
    const fileAge = Date.now() - stats.mtime.getTime();
    const twoHours = 2 * 60 * 60 * 1000; // 2 heures en millisecondes
    
    // Supprimer les fichiers temporaires et les vidéos de plus de 2 heures
    if (!file.includes('video_with_subtitles') || fileAge > twoHours) {
      fs.removeSync(filePath);
      console.log(`🗑️ Supprimé: ${file}`);
    }
  });
  
  // Nettoyer complètement le dossier subtitles
  const subtitleFiles = fs.readdirSync(subtitlesDir);
  subtitleFiles.forEach(file => {
    const filePath = path.join(subtitlesDir, file);
    fs.removeSync(filePath);
    console.log(`🗑️ Supprimé: ${file}`);
  });
  
  console.log('✅ Nettoyage terminé');
} catch (error) {
  console.log('⚠️ Erreur lors du nettoyage:', error.message);
}

// Configuration Multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|mkv|webm|m4v/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers vidéo sont autorisés'));
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB max
  }
});

// Routes API

// Upload de vidéo
app.post('/api/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier vidéo fourni' });
    }

    const videoPath = req.file.path;
    const videoId = path.basename(req.file.filename, path.extname(req.file.filename));
    
    res.json({
      success: true,
      videoId: videoId,
      filename: req.file.originalname,
      path: videoPath
    });
  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload' });
  }
});

// Transcription de la vidéo
app.post('/api/transcribe', async (req, res) => {
  try {
    const { videoPath, language } = req.body;
    
    if (!videoPath || !fs.existsSync(videoPath)) {
      return res.status(400).json({ error: 'Fichier vidéo introuvable' });
    }

    // Extraire l'audio de la vidéo
    const audioPath = path.join(uploadsDir, `${uuidv4()}.mp3`);
    
    // Configurer FFmpeg pour utiliser le PATH système
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    // Préparer l'environnement avec le PATH système
    const env = { ...process.env };
    
    // Ajouter les chemins système courants pour macOS
    const systemPaths = [
      '/usr/local/bin',
      '/opt/homebrew/bin',
      '/usr/bin',
      '/bin'
    ];
    
    // Ajouter au PATH si pas déjà présent
    systemPaths.forEach(systemPath => {
      if (fs.existsSync(systemPath) && !env.PATH.includes(systemPath)) {
        env.PATH = `${systemPath}:${env.PATH}`;
      }
    });
    
    // Essayer de trouver FFmpeg dans le PATH système
    try {
      const { stdout } = await execAsync('which ffmpeg', { env });
      const ffmpegPath = stdout.trim();
      if (ffmpegPath) {
        ffmpeg.setFfmpegPath(ffmpegPath);
        console.log(`✅ FFmpeg trouvé dans le PATH: ${ffmpegPath}`);
      }
    } catch (error) {
      console.log('⚠️ FFmpeg non trouvé dans le PATH, utilisation par défaut');
    }
    
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .toFormat('mp3')
        .on('end', resolve)
        .on('error', reject)
        .save(audioPath);
    });

    let segments = [];

    // Essayer d'abord Whisper local via ligne de commande
    try {
      console.log('Tentative de transcription avec Whisper local...');
      
      // Utiliser Whisper en ligne de commande
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);
      
      // Préparer l'environnement avec le PATH système
      const env = { ...process.env };
      
      // En mode packagé, forcer l'utilisation du PATH système
      if (process.env.NODE_ENV === 'production' || process.resourcesPath) {
        console.log('📦 Mode packagé - récupération du PATH système...');
        const { execSync } = require('child_process');
        try {
          const systemPath = execSync('echo $PATH', { shell: '/bin/zsh' }).toString().trim();
          env.PATH = systemPath;
          console.log('🔧 PATH système forcé pour Whisper:', env.PATH);
        } catch (error) {
          console.log('⚠️ Impossible de récupérer le PATH système:', error.message);
        }
      } else {
        // En mode développement, ajouter les chemins système courants
        const systemPaths = [
          '/usr/local/bin',
          '/opt/homebrew/bin',
          '/usr/bin',
          '/bin',
          '/Library/Frameworks/Python.framework/Versions/3.12/bin'  // Python framework (Whisper)
        ];
        
        // Ajouter au PATH si pas déjà présent
        systemPaths.forEach(systemPath => {
          if (fs.existsSync(systemPath) && !env.PATH.includes(systemPath)) {
            env.PATH = `${systemPath}:${env.PATH}`;
          }
        });
      }
      
      console.log('🔍 PATH système pour Whisper:', env.PATH);
      
      // Commande Whisper avec timestamps et précision FP32 (désactive FP16)
      const whisperCommand = `whisper "${audioPath}" --model ${WHISPER_MODEL} --language ${WHISPER_LANGUAGE} --fp16 False --output_format json --output_dir "${uploadsDir}"`;
      
      console.log('Exécution de la commande Whisper:', whisperCommand);
      
      const { stdout, stderr } = await execAsync(whisperCommand, { env });
      
      console.log('✅ Whisper stdout:', stdout);
      if (stderr) {
        console.log('⚠️ Whisper stderr:', stderr);
      }
      
      // Lire le fichier JSON généré par Whisper
      const jsonPath = audioPath.replace('.mp3', '.json');
      console.log('🔍 Recherche du fichier JSON:', jsonPath);
      console.log('📁 Fichier JSON existe:', fs.existsSync(jsonPath));
      
      // Lister les fichiers dans le dossier uploads pour debug
      console.log('📂 Contenu du dossier uploads:', fs.readdirSync(uploadsDir));
      
      if (fs.existsSync(jsonPath)) {
        const whisperResult = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        segments = parseWhisperJSON(whisperResult);
        
        // Nettoyer le fichier JSON temporaire
        fs.removeSync(jsonPath);
        
        console.log('Transcription Whisper local réussie');
      } else {
        throw new Error('Fichier JSON Whisper non trouvé');
      }
      
    } catch (whisperError) {
      console.log('Whisper local échoué, tentative avec OpenAI...');
      
      // Fallback vers OpenAI si disponible
      if (openai) {
        try {
          const audioFile = fs.createReadStream(audioPath);
          
          const transcript = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            language: language || "fr",
            response_format: "verbose_json",
            timestamp_granularities: ["segment"]
          });
          
          segments = transcript.segments;
          console.log('Transcription OpenAI réussie');
          
        } catch (openaiError) {
          console.error('Erreur OpenAI:', openaiError);
          throw new Error('Aucun service de transcription disponible');
        }
      } else {
        throw new Error('Whisper local non disponible et OpenAI non configuré');
      }
    }

    // Convertir en format SRT
    const srtContent = convertToSRT(segments);
    const srtPath = path.join(subtitlesDir, `${path.basename(videoPath, path.extname(videoPath))}.srt`);
    fs.writeFileSync(srtPath, srtContent);

    // Nettoyer le fichier audio temporaire
    fs.removeSync(audioPath);

    res.json({
      success: true,
      transcription: segments,
      srtPath: srtPath,
      srtContent: srtContent
    });

  } catch (error) {
    console.error('Erreur transcription:', error);
    res.status(500).json({ error: 'Erreur lors de la transcription: ' + error.message });
  }
});

// Traduction via Ollama
app.post('/api/translate', async (req, res) => {
  try {
    const { segments, targetLanguage, sourceLanguage } = req.body;
    
    if (!segments || !targetLanguage) {
      return res.status(400).json({ error: 'Segments and target language required' });
    }

    // Configurer les headers pour Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const translatedSegments = [];
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const prompt = `Translate the following text from ${sourceLanguage || 'English'} to ${targetLanguage}. 
      Keep the same style and tone. Return only the translation without explanations:
      
      "${segment.text}"`;
      
      try {
        const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
          model: OLLAMA_MODEL,
          prompt: prompt,
          stream: false
        });
        
        let translation = response.data.response.trim();
        
        // Nettoyer les guillemets au début et à la fin
        translation = translation.replace(/^["']+|["']+$/g, '');
        
        const translatedSegment = {
          ...segment,
          translatedText: translation
        };
        
        translatedSegments[i] = translatedSegment;
        
        // Envoyer le progrès en temps réel
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          current: i + 1,
          total: segments.length,
          segment: translatedSegment
        })}\n\n`);
        
      } catch (ollamaError) {
        console.error('Ollama error:', ollamaError);
        const translatedSegment = {
          ...segment,
          translatedText: segment.text // Garder l'original en cas d'erreur
        };
        
        translatedSegments[i] = translatedSegment;
        
        res.write(`data: ${JSON.stringify({
          type: 'progress',
          current: i + 1,
          total: segments.length,
          segment: translatedSegment
        })}\n\n`);
      }
    }

    // Envoyer la réponse finale
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      success: true,
      translatedSegments: translatedSegments
    })}\n\n`);
    
    res.end();

  } catch (error) {
    console.error('Translation error:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: 'Translation error: ' + error.message
    })}\n\n`);
    res.end();
  }
});

// Sauvegarder les sous-titres traduits
app.post('/api/save-subtitles', async (req, res) => {
  try {
    const { segments, filename } = req.body;
    
    if (!segments || !filename) {
      return res.status(400).json({ error: 'Segments et nom de fichier requis' });
    }

    const srtContent = convertToSRT(segments, true);
    const srtPath = path.join(subtitlesDir, `${filename}.srt`);
    
    fs.writeFileSync(srtPath, srtContent);
    
    // Télécharger directement le fichier SRT
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.srt"`);
    res.send(srtContent);

  } catch (error) {
    console.error('Erreur sauvegarde:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
  }
});

// Appliquer les sous-titres à la vidéo
app.post('/api/apply-subtitles', async (req, res) => {
  try {
    const { videoPath, srtContent, outputFilename } = req.body;
    
    if (!videoPath || !srtContent || !outputFilename) {
      return res.status(400).json({ error: 'Video path, subtitle content and output filename required' });
    }

    let sanitizedFilename = sanitizeFilename(outputFilename);
    
    // S'assurer que le fichier a une extension .mp4
    if (!sanitizedFilename.toLowerCase().endsWith('.mp4')) {
      sanitizedFilename = sanitizedFilename.replace(/\.[^.]*$/, '') + '.mp4';
    }
    
    const outputPath = path.join(outputDir, sanitizedFilename);
    
    // Créer un fichier SRT temporaire avec un nom simple
    const tempSrtPath = path.join(uploadsDir, `temp_subtitles_${Date.now()}.srt`);
    
    // Nettoyer et valider le contenu SRT
    const cleanSrtContent = srtContent
      .replace(/\r\n/g, '\n')  // Normaliser les retours à la ligne
      .replace(/\r/g, '\n')    // Remplacer les retours chariot
      .trim();                 // Supprimer les espaces en début/fin
    
    // Valider que le contenu SRT n'est pas vide
    if (!cleanSrtContent || cleanSrtContent.length < 10) {
      throw new Error('Invalid or empty SRT content');
    }
    
    // Vérifier que le contenu contient au moins un segment valide
    const lines = cleanSrtContent.split('\n');
    let hasValidSegment = false;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].match(/^\d+$/) && i + 2 < lines.length) {
        const timeLine = lines[i + 1];
        if (timeLine.match(/\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/)) {
          hasValidSegment = true;
          break;
        }
      }
    }
    
    if (!hasValidSegment) {
      throw new Error('No valid SRT segments found in content');
    }
    
    fs.writeFileSync(tempSrtPath, cleanSrtContent, 'utf8');
    
    // Vérifier que le fichier SRT a été créé correctement
    if (!fs.existsSync(tempSrtPath)) {
      throw new Error('Failed to create temporary SRT file');
    }
    
    console.log('SRT content preview:', cleanSrtContent.substring(0, 200));
    console.log('Temp SRT path:', tempSrtPath);
    console.log('Output path:', outputPath);
    
    await new Promise((resolve, reject) => {
      const ffmpegCommand = ffmpeg(videoPath)
        .videoFilters(`subtitles='${tempSrtPath.replace(/\\/g, '/').replace(/'/g, "\\'")}':force_style='FontSize=18,PrimaryColour=&Hffffff,OutlineColour=&H000000,Bold=1'`)
        .outputOptions('-c:a copy')
        .outputOptions('-y') // Overwrite output file
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('FFmpeg progress:', progress);
        })
        .on('end', () => {
          console.log('FFmpeg processing completed');
          // Nettoyer le fichier SRT temporaire
          if (fs.existsSync(tempSrtPath)) {
            fs.removeSync(tempSrtPath);
          }
          resolve();
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          // Nettoyer le fichier SRT temporaire en cas d'erreur
          if (fs.existsSync(tempSrtPath)) {
            fs.removeSync(tempSrtPath);
          }
          reject(err);
        });
      
      ffmpegCommand.save(outputPath);
    });

    res.json({
      success: true,
      outputPath: outputPath,
      outputFilename: sanitizedFilename,
      message: 'Video with subtitles created successfully'
    });

  } catch (error) {
    console.error('Error applying subtitles:', error);
    res.status(500).json({ error: 'Error applying subtitles' });
  }
});

// Servir une vidéo
app.get('/api/video/:path(*)', (req, res) => {
  try {
    const videoPath = decodeURIComponent(req.params.path);
    
    if (!fs.existsSync(videoPath)) {
      return res.status(404).json({ error: 'Video file not found' });
    }
    
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize-1;
      const chunksize = (end-start) + 1;
      const file = fs.createReadStream(videoPath, {start, end});
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error('Error serving video:', error);
    res.status(500).json({ error: 'Error serving video' });
  }
});

// Télécharger un fichier
app.get('/api/download/:type/:filename', (req, res) => {
  try {
    const { type, filename } = req.params;
    let filePath;
    
    switch (type) {
      case 'srt':
        filePath = path.join(subtitlesDir, filename);
        break;
      case 'video':
        filePath = path.join(outputDir, filename);
        break;
      default:
        return res.status(400).json({ error: 'Invalid file type' });
    }
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    // Définir les headers pour le téléchargement
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', type === 'video' ? 'video/mp4' : 'text/plain');
    
    // Streamer le fichier
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      res.status(500).json({ error: 'File stream error' });
    });
    
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download error' });
  }
});

// Route spécifique pour télécharger les vidéos (compatibilité)
app.get('/api/download/video/:filename', (req, res) => {
  try {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(outputDir, filename);
    
    console.log('Download request for video:', filename);
    console.log('File path:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    
    if (!fs.existsSync(filePath)) {
      console.error('Video file not found:', filePath);
      return res.status(404).json({ error: 'Video file not found' });
    }
    
    const stats = fs.statSync(filePath);
    console.log('File size:', stats.size, 'bytes');
    
    // Définir les headers pour le téléchargement
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Streamer le fichier
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    
    fileStream.on('error', (error) => {
      console.error('Video download error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Video download error' });
      }
    });
    
    fileStream.on('end', () => {
      console.log('Video download completed:', filename);
    });
    
  } catch (error) {
    console.error('Video download error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Video download error' });
    }
  }
});



// Route de test pour vérifier les fichiers disponibles
app.get('/api/test-download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(outputDir, filename);
    
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      res.json({
        exists: true,
        filename: filename,
        path: filePath,
        size: stats.size,
        downloadUrl: `/api/download/video/${encodeURIComponent(filename)}`
      });
    } else {
      res.json({
        exists: false,
        filename: filename,
        availableFiles: fs.readdirSync(outputDir)
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Configuration de l'application
app.get('/api/config', (req, res) => {
  res.json({
    ollamaBaseUrl: OLLAMA_BASE_URL,
    ollamaModel: OLLAMA_MODEL,
    whisperModel: WHISPER_MODEL,
    whisperLanguage: WHISPER_LANGUAGE,
    openaiAvailable: !!openai
  });
});

// Lister les fichiers SRT disponibles
app.get('/api/subtitles', (req, res) => {
  try {
    const files = fs.readdirSync(subtitlesDir)
      .filter(file => file.endsWith('.srt'))
      .map(file => ({
        name: file,
        path: path.join(subtitlesDir, file),
        size: fs.statSync(path.join(subtitlesDir, file)).size
      }));
    
    res.json({ files });
  } catch (error) {
    console.error('Erreur liste fichiers:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des fichiers' });
  }
});

// Charger un fichier SRT
app.get('/api/subtitles/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(subtitlesDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Fichier introuvable' });
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const segments = parseSRT(content);
    
    res.json({
      filename: filename,
      content: content,
      segments: segments
    });
  } catch (error) {
    console.error('Erreur chargement fichier:', error);
    res.status(500).json({ error: 'Erreur lors du chargement du fichier' });
  }
});

// Fonctions utilitaires

function convertToSRT(segments, useTranslated = false) {
  return segments.map((segment, index) => {
    const startTime = formatTime(segment.start);
    const endTime = formatTime(segment.end);
    const text = useTranslated ? segment.translatedText : segment.text;
    
    return `${index + 1}\n${startTime} --> ${endTime}\n${text}\n`;
  }).join('\n');
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

function parseSRT(content) {
  const segments = [];
  const blocks = content.trim().split('\n\n');
  
  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      const timeLine = lines[1];
      const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
      
      if (timeMatch) {
        const startTime = parseTime(timeMatch[1]);
        const endTime = parseTime(timeMatch[2]);
        const text = lines.slice(2).join('\n');
        
        segments.push({
          start: startTime,
          end: endTime,
          text: text
        });
      }
    }
  }
  
  return segments;
}

function parseTime(timeString) {
  const [time, ms] = timeString.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + ms / 1000;
}

// Parser la réponse JSON de Whisper local
function parseWhisperJSON(whisperResult) {
  const segments = [];
  
  if (whisperResult.segments && Array.isArray(whisperResult.segments)) {
    segments.push(...whisperResult.segments.map(segment => ({
      start: segment.start,
      end: segment.end,
      text: segment.text.trim()
    })));
  } else if (whisperResult.text) {
    // Fallback si pas de segments détaillés
    segments.push({
      start: 0,
      end: 30, // Estimation
      text: whisperResult.text.trim()
    });
  }
  
  return segments;
}

// Gestion des erreurs
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Application accessible sur http://localhost:${PORT}`);
});
