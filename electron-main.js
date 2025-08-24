const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Importer le serveur directement
let serverApp = null;

// Garder une référence globale de l'objet window
let mainWindow;
let serverProcess;

// Configuration des dossiers
const os = require('os');
const appDataPath = path.join(os.homedir(), '.seia-translator');

const uploadsDir = path.join(appDataPath, 'uploads');
const subtitlesDir = path.join(appDataPath, 'subtitles');
const outputDir = path.join(appDataPath, 'output');

// Créer les dossiers s'ils n'existent pas
if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
}
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(subtitlesDir)) {
    fs.mkdirSync(subtitlesDir, { recursive: true });
}
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

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
            fs.rmSync(filePath, { force: true });
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
            fs.rmSync(filePath, { force: true });
            console.log(`🗑️ Supprimé: ${file}`);
        }
    });
    
    // Nettoyer complètement le dossier subtitles
    const subtitleFiles = fs.readdirSync(subtitlesDir);
    subtitleFiles.forEach(file => {
        const filePath = path.join(subtitlesDir, file);
        fs.rmSync(filePath, { force: true });
        console.log(`🗑️ Supprimé: ${file}`);
    });
    
    console.log('✅ Nettoyage terminé');
} catch (error) {
    console.log('⚠️ Erreur lors du nettoyage:', error.message);
}

// Vérifier si le serveur est déjà en cours d'exécution
function checkServerStatus() {
    return new Promise((resolve) => {
        const http = require('http');
        const req = http.request({
            hostname: 'localhost',
            port: 3001,
            path: '/',
            method: 'GET',
            timeout: 2000
        }, (res) => {
            console.log(`✅ Serveur déjà en cours d'exécution sur le port 3001`);
            resolve(true);
        });
        
        req.on('error', () => {
            console.log(`❌ Aucun serveur trouvé sur le port 3001`);
            resolve(false);
        });
        
        req.on('timeout', () => {
            console.log(`⏰ Timeout lors de la vérification du serveur`);
            resolve(false);
        });
        
        req.end();
    });
}

// Démarrer le serveur Node.js intégré d'Electron
async function startServer() {
    const serverRunning = await checkServerStatus();
    
    if (serverRunning) {
        console.log('✅ Utilisation du serveur existant');
        return;
    }
    
    console.log('🚀 Démarrage du serveur intégré d\'Electron...');
    
    try {
        // Charger le serveur directement dans le processus Electron
        let serverPath;
        
        if (app.isPackaged) {
            // En mode packagé, essayer plusieurs chemins
            const possiblePaths = [
                path.join(process.resourcesPath, 'app.asar.unpacked', 'server.js'),
                path.join(process.resourcesPath, 'app.asar', 'server.js'),
                path.join(__dirname, 'server.js')
            ];
            
            for (const testPath of possiblePaths) {
                console.log(`🔍 Test du chemin: ${testPath}`);
                if (fs.existsSync(testPath)) {
                    serverPath = testPath;
                    console.log(`✅ Serveur trouvé: ${serverPath}`);
                    break;
                }
            }
            
            if (!serverPath) {
                throw new Error('Serveur non trouvé dans aucun des chemins possibles');
            }
        } else {
            serverPath = path.join(__dirname, 'server.js');
        }
        
        console.log(`📁 Chargement du serveur: ${serverPath}`);
        
        // Charger le serveur dans le processus Electron
        require(serverPath);
        
        console.log('✅ Serveur intégré démarré');
        
    } catch (error) {
        console.error('❌ Erreur lors du démarrage du serveur intégré:', error);
        dialog.showErrorBox('Erreur serveur', `Impossible de démarrer le serveur: ${error.message}`);
    }
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

    // Charger l'interface depuis le serveur Node.js existant
    console.log('🌐 Chargement de l\'interface...');
    mainWindow.loadURL('http://localhost:3001');

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
        // Le serveur intégré se fermera automatiquement avec l'application
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
app.whenReady().then(async () => {
    console.log('🎉 Application prête !');
    
    // Démarrer le serveur
    await startServer();
    
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
