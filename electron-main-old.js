const { app, BrowserWindow, Menu, dialog, shell } = require('electron');
const path = require('path');
const { spawn, exec } = require('child_process');
const fs = require('fs');

// Garder une référence globale de l'objet window
let mainWindow;
let serverProcess;

// Vérifier si toutes les dépendances sont installées
async function checkDependencies() {
    const dependencies = {
        ffmpeg: false,
        ollama: false,
        whisper: false,
        llamaModel: false
    };

    return new Promise((resolve) => {
        let checksCompleted = 0;
        const totalChecks = 4;

        function checkComplete() {
            checksCompleted++;
            if (checksCompleted === totalChecks) {
                resolve(dependencies);
            }
        }

        // Vérifier FFmpeg
        exec('which ffmpeg', (error) => {
            dependencies.ffmpeg = !error;
            checkComplete();
        });

        // Vérifier Ollama
        exec('which ollama', (error) => {
            dependencies.ollama = !error;
            checkComplete();
        });

        // Vérifier Whisper
        exec('which whisper', (error) => {
            dependencies.whisper = !error;
            checkComplete();
        });

        // Vérifier si le modèle llama3.1 est disponible
        exec('ollama list', (error, stdout) => {
            if (!error && stdout) {
                dependencies.llamaModel = stdout.includes('llama3.1');
            }
            checkComplete();
        });
    });
}

// Afficher un dialogue pour les dépendances manquantes
async function showDependencyDialog(missing) {
    const missingList = missing.join(', ');
    const result = await dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: 'Dependencies Required',
        message: `Missing required dependencies: ${missingList}`,
        detail: `This application requires ${missingList} to function properly. Would you like to open the installation guide?`,
        buttons: ['Open Guide', 'Continue Anyway', 'Quit'],
        defaultId: 0,
        cancelId: 2
    });

    if (result.response === 0) {
        // Ouvrir le guide d'installation approprié
        if (missing.includes('FFmpeg')) {
            shell.openExternal('https://ffmpeg.org/download.html');
        } else if (missing.includes('Ollama')) {
            shell.openExternal('https://ollama.ai/download');
        } else if (missing.includes('Whisper')) {
            shell.openExternal('https://github.com/openai/whisper');
        } else {
            shell.openExternal('https://github.com/ollama/ollama');
        }
    } else if (result.response === 2) {
        app.quit();
    }
}

// Afficher un dialogue pour copier le script d'installation
async function showInstallScriptDialog(missingDeps) {
    const scriptContent = generateInstallScript(missingDeps);
    
    const result = await dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Dépendances manquantes',
        message: 'Certaines dépendances sont manquantes',
        detail: `Dépendances manquantes : ${missingDeps.join(', ')}\n\nVoulez-vous copier un script d'installation dans votre presse-papiers ?\n\nCe script installera automatiquement toutes les dépendances manquantes.`,
        buttons: ['Copier le script', 'Voir le guide manuel', 'Ignorer'],
        defaultId: 0,
        cancelId: 2
    });

    if (result.response === 0) {
        // Copier le script dans le presse-papiers
        require('electron').clipboard.writeText(scriptContent);
        
        await dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Script copié',
            message: 'Script d\'installation copié !',
            detail: 'Le script a été copié dans votre presse-papiers.\n\nPour l\'utiliser :\n1. Ouvrez Terminal\n2. Collez le script (Cmd+V)\n3. Appuyez sur Entrée\n4. Suivez les instructions',
            buttons: ['OK']
        });
    } else if (result.response === 1) {
        // Ouvrir le guide manuel
        shell.openExternal('https://github.com/your-repo/SEIA-Translator/blob/main/INSTALLATION-GUIDE.md');
    }
}

// Générer le script d'installation
function generateInstallScript(missingDeps) {
    const script = `#!/bin/bash

echo "🚀 Installation des dépendances SEIA Translator"
echo "=============================================="

# Couleurs
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
NC='\\033[0m'

print_status() {
    echo -e "\${BLUE}[INFO]\${NC} \$1"
}

print_success() {
    echo -e "\${GREEN}[SUCCESS]\${NC} \$1"
}

# Vérifier l'architecture
if [[ \$(uname -m) != "arm64" ]]; then
    echo "❌ Ce script est conçu pour Apple Silicon (ARM64) uniquement"
    exit 1
fi

print_success "Architecture Apple Silicon détectée"

# Installation de Homebrew si nécessaire
if ! command -v brew &> /dev/null; then
    print_status "Installation de Homebrew..."
    /bin/bash -c "\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    echo 'eval "\$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "\$(/opt/homebrew/bin/brew shellenv)"
    print_success "Homebrew installé"
else
    print_success "Homebrew déjà installé"
fi

# Installer les dépendances manquantes
${missingDeps.map(dep => {
    switch (dep) {
        case 'FFmpeg':
            return `
# Installer FFmpeg
if ! command -v ffmpeg &> /dev/null; then
    print_status "Installation de FFmpeg..."
    /opt/homebrew/bin/brew install ffmpeg
    print_success "FFmpeg installé"
else
    print_success "FFmpeg déjà installé"
fi`;
        case 'Ollama':
            return `
# Installer Ollama
if ! command -v ollama &> /dev/null; then
    print_status "Installation d'Ollama..."
    curl -fsSL https://ollama.ai/install.sh | sh
    print_success "Ollama installé"
else
    print_success "Ollama déjà installé"
fi`;
        case 'Whisper':
            return `
# Installer Whisper
if ! command -v whisper &> /dev/null; then
    print_status "Installation de Whisper..."
    pip3 install openai-whisper
    print_success "Whisper installé"
else
    print_success "Whisper déjà installé"
fi`;
        case 'llama3.1 model':
            return `
# Installer le modèle llama3.1
if ! ollama list | grep -q "llama3.1"; then
    print_status "Installation du modèle llama3.1..."
    ollama serve > /dev/null 2>&1 &
    sleep 5
    ollama pull llama3.1
    print_success "Modèle llama3.1 installé"
else
    print_success "Modèle llama3.1 déjà installé"
fi`;
        default:
            return '';
    }
}).join('')}

echo ""
print_success "Installation terminée !"
echo ""
echo "Vous pouvez maintenant relancer SEIA Translator."
echo "Toutes les dépendances sont installées et configurées !"`;

    return script;
}
    const result = await dialog.showMessageBox(mainWindow, {
        type: 'question',
        title: 'Dépendances manquantes',
        message: 'Certaines dépendances sont manquantes :',
        detail: `Dépendances manquantes : ${missingDeps.join(', ')}\n\nVoulez-vous les installer automatiquement ?\n\nNote : Cela peut prendre plusieurs minutes et nécessite une connexion internet.`,
        buttons: ['Installer automatiquement', 'Installer manuellement', 'Annuler'],
        defaultId: 0,
        cancelId: 2
    });

    if (result.response === 1) {
        // Installation manuelle
        await showDependencyDialog(missingDeps);
        return false;
    }
    
    return result.response === 0; // Retourner true si installation automatique choisie
}

// Installer automatiquement les dépendances manquantes
async function installMissingDependencies(missingDeps) {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);

    try {
        // Afficher une boîte de dialogue de progression
        await dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Installation en cours',
            message: 'Installation des dépendances...',
            detail: 'Veuillez patienter pendant l\'installation.\nCela peut prendre plusieurs minutes.',
            buttons: ['OK']
        });

        // 1. Installer Homebrew directement si nécessaire
        console.log('Vérification de Homebrew...');
        let brewInstalled = false;
        try {
            await execAsync('brew --version');
            console.log('Homebrew déjà installé');
            brewInstalled = true;
        } catch (error) {
            console.log('Installation de Homebrew...');
            await dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Installation de Homebrew',
                message: 'Installation de Homebrew en cours...',
                detail: 'Homebrew est requis pour installer FFmpeg. Cela peut prendre quelques minutes.',
                buttons: ['OK']
            });
            
            // Installation directe de Homebrew pour Apple Silicon
            await execAsync('/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
            
            // Ajouter Homebrew au PATH pour Apple Silicon
            await execAsync('echo \'eval "$(/opt/homebrew/bin/brew shellenv)"\' >> ~/.zprofile');
            await execAsync('source ~/.zprofile');
            await execAsync('eval "$(/opt/homebrew/bin/brew shellenv)"');
            
            brewInstalled = true;
            console.log('Homebrew installé avec succès');
        }

        // 2. Installer les dépendances une par une
        for (const dep of missingDeps) {
            console.log(`Installation de ${dep}...`);
            
            await dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: `Installation de ${dep}`,
                message: `Installation de ${dep} en cours...`,
                detail: 'Veuillez patienter.',
                buttons: ['OK']
            });
            
            try {
                switch (dep) {
                    case 'FFmpeg':
                        await execAsync('/opt/homebrew/bin/brew install ffmpeg');
                        break;
                    case 'Ollama':
                        await execAsync('curl -fsSL https://ollama.ai/install.sh | sh');
                        break;
                    case 'Whisper':
                        // Vérifier si Python et pip sont disponibles
                        try {
                            await execAsync('python3 --version && pip3 --version');
                            await execAsync('pip3 install openai-whisper');
                        } catch (pythonError) {
                            throw new Error('Python3 et pip3 sont requis pour installer Whisper');
                        }
                        break;
                    case 'llama3.1 model':
                        // Vérifier si Ollama est installé d'abord
                        try {
                            await execAsync('ollama --version');
                            // Démarrer Ollama d'abord
                            await execAsync('ollama serve > /dev/null 2>&1 &');
                            await new Promise(resolve => setTimeout(resolve, 5000));
                            await execAsync('ollama pull llama3.1');
                        } catch (ollamaError) {
                            throw new Error('Ollama doit être installé avant le modèle llama3.1');
                        }
                        break;
                }
                
                await dialog.showMessageBox(mainWindow, {
                    type: 'info',
                    title: `${dep} installé`,
                    message: `${dep} a été installé avec succès !`,
                    buttons: ['OK']
                });
                
            } catch (installError) {
                console.error(`Erreur installation ${dep}:`, installError);
                
                const retryChoice = await dialog.showMessageBox(mainWindow, {
                    type: 'error',
                    title: `Erreur installation ${dep}`,
                    message: `Impossible d'installer ${dep} automatiquement`,
                    detail: `Erreur: ${installError.message}\n\nVoulez-vous :\n1. Ouvrir le guide d'installation manuelle\n2. Ignorer cette dépendance`,
                    buttons: ['Guide d\'installation', 'Ignorer'],
                    defaultId: 0,
                    cancelId: 1
                });
                
                if (retryChoice.response === 0) {
                    // Ouvrir les guides d'installation
                    switch (dep) {
                        case 'FFmpeg':
                            shell.openExternal('https://ffmpeg.org/download.html');
                            break;
                        case 'Ollama':
                            shell.openExternal('https://ollama.ai/download');
                            break;
                        case 'Whisper':
                            shell.openExternal('https://github.com/openai/whisper#setup');
                            break;
                        case 'llama3.1 model':
                            shell.openExternal('https://ollama.ai/library/llama3.1');
                            break;
                    }
                }
            }
        }

        await dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: 'Installation terminée',
            message: 'Toutes les dépendances ont été installées avec succès !',
            detail: 'L\'application va maintenant redémarrer.',
            buttons: ['OK']
        });

        // Redémarrer l'application
        app.relaunch();
        app.exit();

    } catch (error) {
        console.error('Erreur lors de l\'installation:', error);
        await dialog.showErrorBox('Erreur d\'installation', 
            `Erreur lors de l'installation de ${missingDeps.join(', ')}:\n${error.message}\n\nVeuillez installer manuellement.`);
    }
}

// Installer le modèle llama3.1 si nécessaire
async function installLlamaModel() {
    return new Promise((resolve) => {
        console.log('Installing llama3.1 model...');
        const installProcess = spawn('ollama', ['pull', 'llama3.1'], {
            stdio: 'pipe'
        });

        installProcess.stdout.on('data', (data) => {
            console.log(`Ollama: ${data}`);
        });

        installProcess.stderr.on('data', (data) => {
            console.error(`Ollama Error: ${data}`);
        });

        installProcess.on('close', (code) => {
            console.log(`Ollama install process exited with code ${code}`);
            resolve(code === 0);
        });
    });
}

// Démarrer le serveur Node.js
async function startServer() {
    console.log('🚀 Démarrage du serveur Node.js...');
    const serverPath = path.join(__dirname, 'server.js');
    console.log('📁 Chemin du serveur:', serverPath);
    console.log('📁 Répertoire de travail:', __dirname);
    
    return new Promise((resolve, reject) => {
        serverProcess = spawn('node', [serverPath], {
            cwd: __dirname,
            stdio: 'pipe',
            env: { ...process.env, PORT: '3001' }
        });
        
        console.log('🔄 Processus serveur créé, PID:', serverProcess.pid);

        serverProcess.stdout.on('data', (data) => {
            console.log(`Server: ${data}`);
            // Si le serveur indique qu'il est prêt, charger l'URL
            const dataStr = data.toString();
            if (dataStr.includes('Server running on port 3001') || dataStr.includes('Application accessible sur http://localhost:3001')) {
                console.log('✅ Serveur prêt, chargement de l\'interface...');
                mainWindow.loadURL('http://localhost:3001');
                resolve();
            }
        });

        serverProcess.stderr.on('data', (data) => {
            console.error(`Server Error: ${data}`);
            // Afficher les erreurs dans une boîte de dialogue
            if (mainWindow && !mainWindow.isDestroyed()) {
                dialog.showErrorBox('Erreur serveur', `Erreur du serveur: ${data}`);
            }
        });

        serverProcess.on('close', (code) => {
            console.log(`Server process exited with code ${code}`);
            if (code !== 0) {
                reject(new Error(`Server exited with code ${code}`));
            }
        });

        serverProcess.on('error', (error) => {
            console.error('Failed to start server:', error);
            dialog.showErrorBox('Erreur serveur', `Impossible de démarrer le serveur: ${error.message}`);
            reject(error);
        });

        // Timeout après 10 secondes
        setTimeout(() => {
            reject(new Error('Server startup timeout'));
        }, 10000);
    });
}

// Créer la fenêtre principale
function createWindow() {
    // Créer la fenêtre du navigateur
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webSecurity: false
        },
        titleBarStyle: 'default',
        show: true, // Afficher immédiatement
        center: true, // Centrer la fenêtre
        resizable: true,
        minimizable: true,
        maximizable: true,
        fullscreenable: true,
        autoHideMenuBar: false
    });

    // Charger l'interface principale immédiatement
    console.log('🌐 Chargement de l\'interface principale...');
    mainWindow.loadURL('http://localhost:3001');
    
    // Forcer l'affichage de la fenêtre
    mainWindow.show();
    mainWindow.focus();
    
    // Vérifier les dépendances après l'affichage de la fenêtre
    mainWindow.webContents.on('did-finish-load', async () => {
        console.log('✅ Interface chargée, vérification des dépendances...');
        
        try {
            const deps = await checkDependencies();
            const missing = [];
            
            if (!deps.ffmpeg) missing.push('FFmpeg');
            if (!deps.ollama) missing.push('Ollama');
            if (!deps.whisper) missing.push('Whisper');
            
            // Si Ollama est installé mais pas le modèle llama3.1, l'installer automatiquement
            if (deps.ollama && !deps.llamaModel) {
                console.log('Ollama found but llama3.1 model missing. Installing...');
                const installResult = await installLlamaModel();
                if (!installResult) {
                    missing.push('llama3.1 model');
                }
            } else if (!deps.ollama) {
                missing.push('llama3.1 model');
            }
            
            if (missing.length > 0) {
                await showInstallScriptDialog(missing);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des dépendances:', error);
        }
    });
    
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
                { role: 'zoom' },
                { type: 'separator' },
                { role: 'front' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Documentation',
                    click: () => {
                        shell.openExternal('https://github.com/your-repo/seia-translator');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// Cette méthode sera appelée quand Electron aura fini de s'initialiser
app.whenReady().then(() => {
    createWindow();
    createMenu();

    app.on('activate', () => {
        // Sur macOS, il est courant de re-créer une fenêtre quand
        // l'icône du dock est cliquée et qu'il n'y a pas d'autres fenêtres ouvertes
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quitter quand toutes les fenêtres sont fermées
app.on('window-all-closed', () => {
    // Sur macOS, il est courant que les applications et leur barre de menu
    // restent actives jusqu'à ce que l'utilisateur quitte explicitement avec Cmd + Q
    if (process.platform !== 'darwin') {
        if (serverProcess) {
            serverProcess.kill();
        }
        app.quit();
    }
});

app.on('before-quit', () => {
    if (serverProcess) {
        serverProcess.kill();
    }
});

// Dans ce fichier, vous pouvez inclure le reste du code principal de votre application
