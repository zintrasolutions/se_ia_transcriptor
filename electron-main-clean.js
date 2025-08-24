const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

// Garder une référence globale de l'objet window
let mainWindow;
let serverProcess;

// Démarrer le serveur Node.js
function startServer() {
    console.log('🚀 Démarrage du serveur Node.js...');
    
    // Nettoyer les dossiers au démarrage
    const foldersToClean = ['subtitles', 'output', 'uploads'];
    foldersToClean.forEach(folder => {
        const folderPath = path.join(__dirname, folder);
        if (fs.existsSync(folderPath)) {
            try {
                fs.rmSync(folderPath, { recursive: true, force: true });
                fs.mkdirSync(folderPath, { recursive: true });
                console.log(`✅ Dossier ${folder} nettoyé`);
            } catch (error) {
                console.error(`❌ Erreur lors du nettoyage de ${folder}:`, error);
            }
        } else {
            try {
                fs.mkdirSync(folderPath, { recursive: true });
                console.log(`✅ Dossier ${folder} créé`);
            } catch (error) {
                console.error(`❌ Erreur lors de la création de ${folder}:`, error);
            }
        }
    });

    // Démarrer le serveur
    serverProcess = spawn('node', ['server.js'], {
        cwd: __dirname,
        stdio: 'pipe'
    });

    serverProcess.stdout.on('data', (data) => {
        console.log('📡 Serveur:', data.toString().trim());
    });

    serverProcess.stderr.on('data', (data) => {
        console.error('❌ Erreur serveur:', data.toString().trim());
    });

    serverProcess.on('close', (code) => {
        console.log('🔴 Serveur fermé avec le code:', code);
    });

    serverProcess.on('error', (error) => {
        console.error('❌ Erreur lors du démarrage du serveur:', error);
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
        if (serverProcess) {
            serverProcess.kill();
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
    
    // Démarrer le serveur
    startServer();
    
    // Attendre un peu que le serveur démarre
    setTimeout(() => {
        // Créer la fenêtre
        createWindow();
        
        // Créer le menu
        createMenu();
        
        console.log('✅ Application initialisée avec succès !');
    }, 2000);
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
