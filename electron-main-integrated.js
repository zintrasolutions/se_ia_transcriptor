const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Importer Express et les modules nécessaires
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');

// Garder une référence globale de l'objet window
let mainWindow;
let server;

// Configuration Express
const appExpress = express();
const PORT = 3001;

// Configuration
appExpress.use(cors());
appExpress.use(express.json());
appExpress.use(express.static(path.join(__dirname, 'public')));

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
    // Nettoyer le dossier uploads
    const uploadFiles = fs.readdirSync(uploadsDir);
    uploadFiles.forEach(file => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = Date.now() - stats.mtime.getTime();
        const oneHour = 60 * 60 * 1000;
        
        if (file.endsWith('.mp3') || file.endsWith('.json') || fileAge > oneHour) {
            fs.removeSync(filePath);
            console.log(`🗑️ Supprimé: ${file}`);
        }
    });
    
    // Nettoyer le dossier output
    const outputFiles = fs.readdirSync(outputDir);
    outputFiles.forEach(file => {
        const filePath = path.join(outputDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = Date.now() - stats.mtime.getTime();
        const twoHours = 2 * 60 * 60 * 1000;
        
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
        const uniqueName = `${uuidv4()}_${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/wmv', 'video/flv', 'video/webm'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Type de fichier non supporté'), false);
        }
    },
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB max
    }
});

// Routes Express
appExpress.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

appExpress.post('/upload', upload.single('video'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Aucun fichier vidéo fourni' });
        }

        const videoPath = req.file.path;
        const videoName = req.file.originalname;
        
        console.log(`📹 Vidéo reçue: ${videoName}`);
        
        res.json({ 
            success: true, 
            message: 'Vidéo uploadée avec succès',
            filename: req.file.filename,
            originalName: videoName
        });
        
    } catch (error) {
        console.error('❌ Erreur upload:', error);
        res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
});

appExpress.post('/process', async (req, res) => {
    try {
        const { filename, originalName } = req.body;
        
        if (!filename) {
            return res.status(400).json({ error: 'Nom de fichier manquant' });
        }

        const videoPath = path.join(uploadsDir, filename);
        
        if (!fs.existsSync(videoPath)) {
            return res.status(404).json({ error: 'Fichier vidéo non trouvé' });
        }

        console.log(`🔄 Traitement de: ${originalName}`);
        
        // Ici vous pouvez ajouter le code de traitement vidéo
        // Pour l'instant, on simule juste un traitement
        
        res.json({ 
            success: true, 
            message: 'Vidéo traitée avec succès',
            filename: filename
        });
        
    } catch (error) {
        console.error('❌ Erreur traitement:', error);
        res.status(500).json({ error: 'Erreur lors du traitement' });
    }
});

// Démarrer le serveur Express
function startServer() {
    console.log('🚀 Démarrage du serveur Express intégré...');
    
    server = appExpress.listen(PORT, () => {
        console.log(`✅ Serveur Express démarré sur le port ${PORT}`);
        console.log(`🌐 Application accessible sur http://localhost:${PORT}`);
    });

    server.on('error', (error) => {
        console.error('❌ Erreur serveur Express:', error);
        dialog.showErrorBox('Erreur serveur', `Impossible de démarrer le serveur: ${error.message}`);
    });
}

// Créer la fenêtre principale
function createWindow() {
    console.log('🪟 Création de la fenêtre principale...');
    
    // Créer la fenêtre du navigateur
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: true,
        center: true,
        resizable: true,
        minimizable: true,
        maximizable: true,
        fullscreenable: true,
        autoHideMenuBar: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
            allowRunningInsecureContent: true
        },
        icon: path.join(__dirname, 'assets', 'icon.icns')
    });

    // Charger l'interface
    console.log('🌐 Chargement de l\'interface...');
    mainWindow.loadURL(`http://localhost:${PORT}`);

    // Gérer les erreurs de chargement
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('❌ Erreur de chargement:', errorCode, errorDescription, validatedURL);
        dialog.showErrorBox('Erreur de chargement', `Impossible de charger l'interface: ${errorDescription}`);
    });
    
    // Gérer le chargement réussi
    mainWindow.webContents.on('did-finish-load', () => {
        console.log('✅ Interface chargée avec succès');
    });
    
    // Gérer le début du chargement
    mainWindow.webContents.on('did-start-loading', () => {
        console.log('🔄 Début du chargement de l\'interface...');
    });
    
    // Gérer les erreurs de navigation
    mainWindow.webContents.on('did-fail-provisional-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('❌ Erreur de navigation:', errorCode, errorDescription, validatedURL);
    });

    // Ouvrir les DevTools en mode développement
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    // Émis quand la fenêtre est fermée
    mainWindow.on('closed', () => {
        mainWindow = null;
        if (server) {
            server.close();
        }
    });
    
    // S'assurer que la fenêtre reste visible
    mainWindow.on('hide', () => {
        console.log('🪟 Fenêtre masquée, la remettre au premier plan...');
        mainWindow.show();
        mainWindow.focus();
    });
    
    // Gérer l'activation de l'application
    mainWindow.on('focus', () => {
        console.log('🎯 Fenêtre focalisée');
    });

    // Gérer les liens externes
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
}

// Créer le menu de l'application
function createMenu() {
    const template = [
        {
            label: 'SEIA Translator',
            submenu: [
                {
                    label: 'About SEIA Translator',
                    click: () => {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            title: 'About',
                            message: 'SEIA Translator',
                            detail: 'Video transcription and translation with subtitles\nVersion 1.0.0'
                        });
                    }
                },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideothers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'File',
            submenu: [
                {
                    label: 'Open Video',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            document.getElementById('videoFile').click();
                        `);
                    }
                },
                { type: 'separator' },
                { role: 'close' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' },
                { role: 'selectall' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Quand l'application est prête
app.whenReady().then(() => {
    console.log('🎉 Application prête !');
    
    // Démarrer le serveur Express
    startServer();
    
    // Attendre un peu que le serveur démarre
    setTimeout(() => {
        // Créer la fenêtre
        createWindow();
        
        // Créer le menu
        createMenu();
        
        console.log('✅ Application initialisée avec succès !');
    }, 1000);
});

// Quitter quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
    console.log('🔴 Toutes les fenêtres fermées');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Activer l'application quand on clique sur l'icône du dock
app.on('activate', () => {
    console.log('🎯 Application activée');
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    } else {
        mainWindow.show();
        mainWindow.focus();
    }
});

// Gérer les erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('❌ Erreur non capturée:', error);
    dialog.showErrorBox('Erreur critique', `Une erreur critique s'est produite: ${error.message}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesse rejetée non gérée:', reason);
    dialog.showErrorBox('Erreur critique', `Une promesse a été rejetée: ${reason}`);
});
