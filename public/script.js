// Global variables
let currentProject = null;
let currentVideoPath = null;
let currentSegments = [];
let translatedSegments = [];
let currentVideoElement = null;
let currentExportedVideoFilename = null;
let projects = [];

// Language options - Complete list ordered alphabetically by English name
const languages = {
    'af': 'Afrikaans',
    'sq': 'Albanian',
    'am': 'Amharic',
    'ar': 'Arabic',
    'hy': 'Armenian',
    'az': 'Azerbaijani',
    'eu': 'Basque',
    'be': 'Belarusian',
    'bn': 'Bengali',
    'bs': 'Bosnian',
    'bg': 'Bulgarian',
    'ca': 'Catalan',
    'ceb': 'Cebuano',
    'zh': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'co': 'Corsican',
    'hr': 'Croatian',
    'cs': 'Czech',
    'da': 'Danish',
    'nl': 'Dutch',
    'en': 'English',
    'eo': 'Esperanto',
    'et': 'Estonian',
    'fi': 'Finnish',
    'fr': 'French',
    'fy': 'Frisian',
    'gl': 'Galician',
    'ka': 'Georgian',
    'de': 'German',
    'el': 'Greek',
    'gu': 'Gujarati',
    'ht': 'Haitian Creole',
    'ha': 'Hausa',
    'haw': 'Hawaiian',
    'he': 'Hebrew',
    'hi': 'Hindi',
    'hmn': 'Hmong',
    'hu': 'Hungarian',
    'is': 'Icelandic',
    'ig': 'Igbo',
    'id': 'Indonesian',
    'ga': 'Irish',
    'it': 'Italian',
    'ja': 'Japanese',
    'jv': 'Javanese',
    'kn': 'Kannada',
    'kk': 'Kazakh',
    'km': 'Khmer',
    'ko': 'Korean',
    'ku': 'Kurdish',
    'ky': 'Kyrgyz',
    'lo': 'Lao',
    'la': 'Latin',
    'lv': 'Latvian',
    'lt': 'Lithuanian',
    'lb': 'Luxembourgish',
    'mk': 'Macedonian',
    'mg': 'Malagasy',
    'ms': 'Malay',
    'ml': 'Malayalam',
    'mt': 'Maltese',
    'mi': 'Maori',
    'mr': 'Marathi',
    'mn': 'Mongolian',
    'my': 'Myanmar (Burmese)',
    'ne': 'Nepali',
    'no': 'Norwegian',
    'ny': 'Nyanja (Chichewa)',
    'or': 'Odia (Oriya)',
    'ps': 'Pashto',
    'fa': 'Persian',
    'pl': 'Polish',
    'pt': 'Portuguese',
    'pa': 'Punjabi',
    'ro': 'Romanian',
    'ru': 'Russian',
    'sm': 'Samoan',
    'gd': 'Scots Gaelic',
    'sr': 'Serbian',
    'st': 'Sesotho',
    'sn': 'Shona',
    'sd': 'Sindhi',
    'si': 'Sinhala (Sinhalese)',
    'sk': 'Slovak',
    'sl': 'Slovenian',
    'so': 'Somali',
    'es': 'Spanish',
    'su': 'Sundanese',
    'sw': 'Swahili',
    'sv': 'Swedish',
    'tg': 'Tajik',
    'ta': 'Tamil',
    'tt': 'Tatar',
    'te': 'Telugu',
    'th': 'Thai',
    'tr': 'Turkish',
    'tk': 'Turkmen',
    'ak': 'Twi',
    'uk': 'Ukrainian',
    'ur': 'Urdu',
    'ug': 'Uyghur',
    'uz': 'Uzbek',
    've': 'Venda',
    'vi': 'Vietnamese',
    'cy': 'Welsh',
    'xh': 'Xhosa',
    'yi': 'Yiddish',
    'yo': 'Yoruba',
    'zu': 'Zulu'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguageSelects();
    setupEventListeners();
    checkOllamaStatus();
    loadProjects(); // Charger les projets au démarrage
});

// Fonctions de gestion des projets
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        if (response.ok) {
            projects = await response.json();
            displayProjects();
        } else {
            console.error('Erreur lors du chargement des projets');
        }
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
    }
}

function displayProjects() {
    const projectsList = document.getElementById('projectsList');
    const noProjects = document.getElementById('noProjects');
    
    if (projects.length === 0) {
        projectsList.style.display = 'none';
        noProjects.style.display = 'block';
        return;
    }
    
    projectsList.style.display = 'grid';
    noProjects.style.display = 'none';
    
    projectsList.innerHTML = projects.map(project => createProjectCard(project)).join('');
}

function createProjectCard(project) {
    const statusText = getStatusText(project.status);
    const statusClass = `project-status ${project.status}`;
    const date = new Date(project.createdAt).toLocaleDateString('fr-FR');
    
    return `
        <div class="project-card" data-project-id="${project.id}">
            <button class="project-delete" onclick="deleteProject('${project.id}', event)">
                <i class="fas fa-trash"></i>
            </button>
            <div class="project-header">
                <div>
                    <div class="project-title">${project.name}</div>
                    <div class="project-date">Created on ${date}</div>
                </div>
                <span class="${statusClass}">${statusText}</span>
            </div>
            <div class="project-info">
                <div class="project-info-item">
                    <i class="fas fa-video"></i>
                    <span>${project.originalName}</span>
                </div>
                ${project.segments.length > 0 ? `
                    <div class="project-info-item">
                        <i class="fas fa-microphone"></i>
                        <span>${project.segments.length} segments</span>
                    </div>
                ` : ''}
                ${project.translatedSegments.length > 0 ? `
                    <div class="project-info-item">
                        <i class="fas fa-language"></i>
                        <span>Traduit en ${getLanguageName(project.targetLanguage)}</span>
                    </div>
                ` : ''}
            </div>
            <div class="project-actions">
                <button class="btn btn-primary" onclick="openProject('${project.id}')">
                    <i class="fas fa-edit"></i> Open
                </button>
                <button class="btn btn-secondary" onclick="renameProject('${project.id}', '${project.name.replace(/'/g, "\\'")}')">
                    <i class="fas fa-edit"></i> Rename
                </button>
                ${project.exportedVideo ? `
                    <button class="btn btn-secondary" onclick="downloadExportedVideo('${project.id}')">
                        <i class="fas fa-download"></i> Video
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function getStatusText(status) {
    const statusMap = {
        'uploaded': 'Uploaded',
        'transcribing': 'Transcribing...',
        'transcribed': 'Transcribed',
        'translating': 'Translating...',
        'translated': 'Translated',
        'exported': 'Exported'
    };
    return statusMap[status] || status;
}

function getLanguageName(code) {
    return languages[code] || code;
}

async function openProject(projectId) {
    console.log('🔍 Tentative d\'ouverture du projet:', projectId);
    try {
        const response = await fetch(`/api/projects/${projectId}`);
        console.log('📡 Réponse du serveur:', response.status);
        
        if (response.ok) {
            currentProject = await response.json();
            console.log('📋 Projet chargé:', currentProject);
            
            currentVideoPath = currentProject.videoPath;
            currentSegments = currentProject.segments || [];
            translatedSegments = currentProject.translatedSegments || [];
            
            console.log('🎥 Chemin vidéo:', currentVideoPath);
            console.log('📝 Segments:', currentSegments.length);
            console.log('🌐 Segments traduits:', translatedSegments.length);
            console.log('📋 Détail des segments traduits:', translatedSegments);
            
            // Mettre à jour l'interface selon le statut du projet
            updateInterfaceForProject();
            
            // Afficher les données selon l'état du projet
            if (currentSegments.length > 0) {
                // Afficher d'abord la transcription
                displayTranscription(currentSegments);
                
                // Si il y a des traductions, afficher aussi la traduction
                if (translatedSegments.length > 0) {
                    // Charger la vidéo dans le lecteur
                    const video = document.getElementById('previewVideo');
                    if (video && currentVideoPath) {
                        video.src = `/api/video/${encodeURIComponent(currentVideoPath)}`;
                        video.load();
                    }
                    
                    // Afficher les segments traduits
                    updateTranslationDisplay();
                    
                    // Passer à l'onglet traduction
                    switchTab('translate');
                } else {
                    // Passer à l'onglet transcription
                    switchTab('transcribe');
                }
            } else {
                switchTab('upload');
            }
            
            showNotification('Projet chargé avec succès', 'success');
        } else {
            const errorData = await response.json();
            console.error('❌ Erreur serveur:', errorData);
            showNotification('Erreur lors du chargement du projet: ' + (errorData.error || 'Erreur inconnue'), 'error');
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'ouverture du projet:', error);
        showNotification('Erreur lors de l\'ouverture du projet: ' + error.message, 'error');
    }
}

function updateInterfaceForProject() {
    // Mettre à jour les langues selon le projet
    if (currentProject.sourceLanguage) {
        document.getElementById('sourceLanguage').value = currentProject.sourceLanguage;
    }
    if (currentProject.targetLanguage) {
        document.getElementById('targetLanguage').value = currentProject.targetLanguage;
    }
    
    // Mettre à jour le nom de fichier de sortie
    if (currentProject.name) {
        document.getElementById('outputFilename').value = `${currentProject.name}_avec_sous_titres.mp4`;
    }
}

async function deleteProject(projectId, event) {
    event.stopPropagation();
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Retirer le projet de la liste locale
            projects = projects.filter(p => p.id !== projectId);
            displayProjects();
            
            // Si c'était le projet actuel, le vider
            if (currentProject && currentProject.id === projectId) {
                currentProject = null;
                currentVideoPath = null;
                currentSegments = [];
                translatedSegments = [];
            }
            
            showNotification('Projet supprimé avec succès', 'success');
        } else {
            showNotification('Erreur lors de la suppression du projet', 'error');
        }
    } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        showNotification('Erreur lors de la suppression du projet', 'error');
    }
}

async function downloadExportedVideo(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (project && project.exportedVideo) {
        const link = document.createElement('a');
        link.href = `/api/video/${encodeURIComponent(project.exportedVideo)}`;
        link.download = path.basename(project.exportedVideo);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

function switchToTab(tabName) {
    // Retirer la classe active de tous les onglets
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Ajouter la classe active à l'onglet sélectionné
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Fonction pour filtrer les projets par recherche
function filterProjects() {
    const searchTerm = document.getElementById('projectSearch').value.toLowerCase().trim();
    const projectCards = document.querySelectorAll('.project-card');
    let visibleCount = 0;
    
    projectCards.forEach(card => {
        const projectName = card.querySelector('.project-title').textContent.toLowerCase();
        const originalName = card.querySelector('.project-info-item span').textContent.toLowerCase();
        
        // Recherche dans le nom du projet et le nom original du fichier
        if (projectName.includes(searchTerm) || originalName.includes(searchTerm)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Afficher un message si aucun projet ne correspond
    const noResultsMessage = document.getElementById('noResultsMessage');
    
    if (visibleCount === 0 && searchTerm !== '') {
        if (!noResultsMessage) {
            const message = document.createElement('div');
            message.id = 'noResultsMessage';
            message.className = 'no-results';
            message.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <h3>No projects found</h3>
                    <p>No projects match "${searchTerm}"</p>
                    <button class="btn btn-secondary" onclick="clearSearch()">
                        <i class="fas fa-times"></i> Clear search
                    </button>
                </div>
            `;
            document.getElementById('projectsList').appendChild(message);
        }
    } else if (noResultsMessage) {
        noResultsMessage.remove();
    }
    
    // Afficher le nombre de résultats trouvés
    updateSearchResults(visibleCount, searchTerm);
}

// Fonction pour effacer la recherche
function clearSearch() {
    document.getElementById('projectSearch').value = '';
    filterProjects();
}

// Fonction pour afficher le nombre de résultats
function updateSearchResults(count, searchTerm) {
    const resultsInfo = document.getElementById('searchResultsInfo');
    
    if (searchTerm !== '') {
        if (!resultsInfo) {
            const info = document.createElement('div');
            info.id = 'searchResultsInfo';
            info.className = 'search-results-info';
            info.innerHTML = `${count} project${count > 1 ? 's' : ''} found`;
            document.querySelector('.projects-controls').appendChild(info);
        } else {
            resultsInfo.innerHTML = `${count} project${count > 1 ? 's' : ''} found`;
        }
    } else if (resultsInfo) {
        resultsInfo.remove();
    }
}

// Variables globales pour le renommage
let currentRenameProjectId = null;
let currentRenameProjectName = null;

// Fonction pour ouvrir le modal de renommage
function renameProject(projectId, currentName) {
    currentRenameProjectId = projectId;
    currentRenameProjectName = currentName;
    
    // Remplir le champ avec le nom actuel
    document.getElementById('newProjectName').value = currentName;
    
    // Afficher le modal
    document.getElementById('renameModal').style.display = 'block';
    
    // Focus sur le champ de saisie
    setTimeout(() => {
        document.getElementById('newProjectName').focus();
        document.getElementById('newProjectName').select();
    }, 100);
}

// Fonction pour fermer le modal de renommage
function closeRenameModal() {
    document.getElementById('renameModal').style.display = 'none';
    currentRenameProjectId = null;
    currentRenameProjectName = null;
}

// Fonction pour confirmer le renommage
async function confirmRenameProject() {
    const newName = document.getElementById('newProjectName').value.trim();
    
    if (!newName || newName === currentRenameProjectName) {
        closeRenameModal();
        return;
    }
    
    try {
        console.log('🔄 Renommage du projet:', currentRenameProjectId, 'vers:', newName);
        
        const response = await fetch(`/api/projects/${currentRenameProjectId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: newName,
                updatedAt: new Date().toISOString()
            })
        });
        
        if (response.ok) {
            const updatedProject = await response.json();
            
            // Mettre à jour le projet actuel s'il s'agit du même projet
            if (currentProject && currentProject.id === currentRenameProjectId) {
                currentProject = updatedProject;
            }
            
            // Recharger la liste des projets
            await loadProjects();
            
            // Fermer le modal
            closeRenameModal();
            
            // Afficher un message de succès
            showNotification('Project renamed successfully!', 'success');
        } else {
            const error = await response.json();
            showNotification('Error during rename: ' + (error.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        console.error('❌ Erreur lors du renommage:', error);
        showNotification('Error during rename: ' + error.message, 'error');
    }
}

// Variable pour le debounce de sauvegarde
let saveTimeout = null;

// Fonction pour sauvegarder les modifications du projet avec debounce
async function saveProjectChanges() {
    if (!currentProject) {
        console.log('⚠️ Aucun projet actuel pour sauvegarder');
        return;
    }
    
    // Annuler la sauvegarde précédente si elle existe
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }
    
    // Programmer une nouvelle sauvegarde dans 2 secondes
    saveTimeout = setTimeout(async () => {
        try {
            console.log('💾 Sauvegarde des modifications du projet...');
            
            // Préparer les données à sauvegarder
            const updates = {
                translatedSegments: translatedSegments,
                updatedAt: new Date().toISOString()
            };
            
            // Envoyer les modifications au serveur
            const response = await fetch(`/api/projects/${currentProject.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });
            
            if (response.ok) {
                const updatedProject = await response.json();
                currentProject = updatedProject;
                console.log('✅ Modifications sauvegardées avec succès');
                
                // Mettre à jour la liste des projets
                await loadProjects();
            } else {
                console.error('❌ Erreur lors de la sauvegarde:', response.status);
            }
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde des modifications:', error);
        }
    }, 2000); // Attendre 2 secondes après la dernière modification
}

// Fonction pour afficher un indicateur de sauvegarde
function showSaveIndicator() {
    // Supprimer l'indicateur existant s'il y en a un
    const existingIndicator = document.getElementById('saveIndicator');
    if (existingIndicator) {
        existingIndicator.remove();
    }
    
    // Créer un nouvel indicateur
    const indicator = document.createElement('div');
    indicator.id = 'saveIndicator';
    indicator.innerHTML = '<i class="fas fa-save"></i> Sauvegarde...';
    indicator.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #17a2b8;
        color: white;
        padding: 10px 15px;
        border-radius: 5px;
        font-size: 14px;
        z-index: 1001;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(indicator);
    
    // Supprimer l'indicateur après 3 secondes
    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.remove();
        }
    }, 3000);
}

function initializeLanguageSelects() {
    const sourceLanguage = document.getElementById('sourceLanguage');
    const targetLanguage = document.getElementById('targetLanguage');
    
    // Clear existing options
    sourceLanguage.innerHTML = '';
    targetLanguage.innerHTML = '';
    
    // Add language options
    Object.entries(languages).forEach(([code, name]) => {
        const sourceOption = document.createElement('option');
        sourceOption.value = code;
        sourceOption.textContent = name;
        sourceOption.selected = code === 'en';
        sourceLanguage.appendChild(sourceOption);
        
        const targetOption = document.createElement('option');
        targetOption.value = code;
        targetOption.textContent = name;
        targetOption.selected = code === 'fr';
        targetLanguage.appendChild(targetOption);
    });
}

function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // File upload
    const uploadArea = document.getElementById('uploadArea');
    const videoFile = document.getElementById('videoFile');

    uploadArea.addEventListener('click', () => videoFile.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('drop', handleDrop);
    videoFile.addEventListener('change', handleFileSelect);

    // Transcription
    document.getElementById('startTranscription').addEventListener('click', startTranscription);

    // Translation
    document.getElementById('startTranslation').addEventListener('click', startTranslation);

    // Export
    document.getElementById('applySubtitles').addEventListener('click', applySubtitles);
    document.getElementById('downloadSRT').addEventListener('click', downloadSRT);
    
    // Projects
    document.getElementById('refreshProjects').addEventListener('click', loadProjects);
    
    // Search functionality
    document.getElementById('projectSearch').addEventListener('input', filterProjects);
    
    // Téléchargement vidéo
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'downloadVideo') {
            e.preventDefault();
            downloadVideoMethod1();
        }
    });
    
    // Gestionnaires pour le modal de renommage
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeRenameModal();
        }
    });
    
    // Fermer le modal en cliquant en dehors
    document.getElementById('renameModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeRenameModal();
        }
    });
    
    // Gestionnaire pour la touche Entrée dans le champ de renommage
    document.getElementById('newProjectName').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            confirmRenameProject();
        }
    });
}

function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file.');
        return;
    }

    if (file.size > 2 * 1024 * 1024 * 1024) {
        alert('File size must be less than 2GB.');
        return;
    }

    uploadFile(file);
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('video', file);

    const progressBar = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const uploadProgress = document.getElementById('uploadProgress');
    const uploadResult = document.getElementById('uploadResult');

    uploadProgress.style.display = 'block';
    uploadResult.style.display = 'none';

    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentProject = data.project;
            currentVideoPath = data.project.videoPath;
            progressBar.style.width = '100%';
            progressText.textContent = 'Projet créé avec succès!';
            
            setTimeout(() => {
                uploadProgress.style.display = 'none';
                uploadResult.style.display = 'block';
                document.getElementById('uploadedFileName').textContent = data.project.originalName;
                
                // Recharger la liste des projets
                loadProjects().then(() => {
                switchTab('transcribe');
                });
            }, 1000);
        } else {
            throw new Error(data.error);
        }
    })
    .catch(error => {
        progressText.textContent = 'Upload failed: ' + error.message;
        progressBar.style.backgroundColor = '#e74c3c';
    });
}

function startTranscription() {
    if (!currentProject) {
        alert('Please first create a project by uploading a video.');
        return;
    }

    const sourceLanguage = document.getElementById('sourceLanguage').value;
    const transcriptionProgress = document.getElementById('transcriptionProgress');
    const transcriptionResult = document.getElementById('transcriptionResult');
    const progressBar = document.getElementById('transcriptionProgressBar');
    const progressText = document.getElementById('transcriptionProgressText');

    transcriptionProgress.style.display = 'block';
    transcriptionResult.style.display = 'none';

    // Simulate progress updates
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        progressBar.style.width = progress + '%';
        progressText.textContent = `Transcribing... ${Math.round(progress)}%`;
    }, 500);

    fetch('/api/transcribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            projectId: currentProject.id,
            language: sourceLanguage
        })
    })
    .then(response => response.json())
    .then(data => {
        clearInterval(progressInterval);
        progressBar.style.width = '100%';
        progressText.textContent = 'Transcription completed!';

        if (data.success) {
            currentSegments = data.transcription;
            translatedSegments = new Array(data.transcription.length);
            
            // Mettre à jour le projet actuel
            if (data.project) {
                currentProject = data.project;
            }
            
            setTimeout(() => {
                transcriptionProgress.style.display = 'none';
                transcriptionResult.style.display = 'block';
                document.getElementById('segmentCount').textContent = data.transcription.length;
                displayTranscription(data.transcription);
                switchTab('translate');
                showNotification(`Transcription completed! ${data.transcription.length} segments detected`, 'success');
                
                // Recharger la liste des projets
                loadProjects();
            }, 1000);
        } else {
            throw new Error(data.error);
        }
    })
    .catch(error => {
        clearInterval(progressInterval);
        progressText.textContent = 'Transcription failed: ' + error.message;
        progressBar.style.backgroundColor = '#e74c3c';
    });
}

function displayTranscription(segments) {
    console.log('🔄 Affichage de la transcription...');
    console.log('📝 Nombre de segments:', segments.length);
    console.log('📋 Segments:', segments);
    
    // Afficher la section de résultat de transcription
    const transcriptionResult = document.getElementById('transcriptionResult');
    if (transcriptionResult) {
        transcriptionResult.style.display = 'block';
        console.log('✅ Section transcriptionResult affichée');
    }
    
    // Masquer la section de progression
    const transcriptionProgress = document.getElementById('transcriptionProgress');
    if (transcriptionProgress) {
        transcriptionProgress.style.display = 'none';
    }
    
    const container = document.getElementById('transcriptionSegments');
    if (!container) {
        console.error('❌ Container transcriptionSegments non trouvé!');
        return;
    }
    
    console.log('📦 Container transcription trouvé, vidage...');
    container.innerHTML = '';

    console.log('🔄 Création des segments dans l\'interface...');
    segments.forEach((segment, index) => {
        console.log(`📄 Création du segment ${index}:`, segment);
        const segmentDiv = document.createElement('div');
        segmentDiv.className = 'segment';
        segmentDiv.innerHTML = `
            <div class="segment-header">
                <span class="segment-time">${formatTime(segment.start)} - ${formatTime(segment.end)}</span>
                <span class="segment-number">#${index + 1}</span>
            </div>
            <div class="segment-text">${segment.text}</div>
        `;
        container.appendChild(segmentDiv);
        console.log(`✅ Segment ${index} ajouté au container`);
    });
    console.log('✅ Tous les segments ont été créés');
    
    // Mettre à jour le compteur de segments
    const segmentCount = document.getElementById('segmentCount');
    if (segmentCount) {
        segmentCount.textContent = segments.length;
        console.log('✅ Compteur de segments mis à jour:', segments.length);
    }
}



function showNotification(message, type = 'info') {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        ${type === 'success' ? 'background: #28a745;' : 
          type === 'error' ? 'background: #dc3545;' : 
          'background: #17a2b8;'}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}



function startTranslation() {
    if (!currentProject || !currentSegments.length) {
        alert('Please first create a project and perform transcription.');
        return;
    }

    const sourceLanguage = document.getElementById('sourceLanguage').value;
    const targetLanguage = document.getElementById('targetLanguage').value;
    const translationProgress = document.getElementById('translationProgress');
    const translationResult = document.getElementById('translationResult');
    const progressBar = document.getElementById('translationProgressBar');
    const progressText = document.getElementById('translationProgressText');

    translationProgress.style.display = 'block';
    translationResult.style.display = 'none';
    translatedSegments = new Array(currentSegments.length);

    // Initialiser la barre de progression
    progressBar.style.width = '0%';
    progressText.textContent = 'Starting translation...';

    fetch('/api/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            projectId: currentProject.id,
            sourceLanguage: sourceLanguage,
            targetLanguage: targetLanguage
        })
    })
    .then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        return new ReadableStream({
            start(controller) {
                function push() {
                    reader.read().then(({done, value}) => {
                        if (done) {
                            controller.close();
                            return;
                        }
                        
                        buffer += decoder.decode(value, {stream: true});
                        const lines = buffer.split('\n');
                        buffer = lines.pop(); // Garder la ligne incomplète
                        
                        lines.forEach(line => {
                            if (line.startsWith('data: ')) {
                                try {
                                    const data = JSON.parse(line.slice(6));
                                    if (data.type === 'progress') {
                                        const progress = (data.current / data.total) * 100;
                                        progressBar.style.width = progress + '%';
                                        progressText.textContent = `Translating... ${data.current}/${data.total}`;
                                        
                                        if (data.segment) {
                                            const index = data.current - 1;
                                            translatedSegments[index] = data.segment;
                                            // Mettre à jour seulement l'affichage des segments, pas le message de progression
                                            updateTranslationSegmentsOnly();
                                        }
                                    } else if (data.type === 'complete') {
                                        // Vérifier que tous les segments sont bien traduits
                                        if (data.translatedSegments && data.translatedSegments.length === currentSegments.length) {
                                        translatedSegments = data.translatedSegments;
                                            
                                            // Mettre à jour l'affichage sans masquer la progression
                                            updateTranslationDisplayWithoutHidingProgress();
                                            
                                            // Afficher le message de succès
                                            progressText.textContent = 'Translation completed!';
                                            progressBar.style.backgroundColor = '#27ae60';
                                        
                                        setTimeout(() => {
                                            translationProgress.style.display = 'none';
                                            translationResult.style.display = 'block';
                                            
                                            // Charger la vidéo dans le lecteur
                                            const video = document.getElementById('previewVideo');
                                            if (video && currentVideoPath) {
                                                video.src = `/api/video/${encodeURIComponent(currentVideoPath)}`;
                                                video.load();
                                            }
                                            }, 2000);
                                        } else {
                                            console.log('⚠️ Traduction incomplète, attente de tous les segments...');
                                        }
                                    } else if (data.type === 'error') {
                                        throw new Error(data.error);
                                    }
                                } catch (e) {
                                    // Ignore parsing errors for incomplete data
                                }
                            }
                        });
                        
                        controller.enqueue(value);
                        push();
                    });
                }
                push();
            }
        });
    })
    .catch(error => {
        progressText.textContent = 'Translation failed: ' + error.message;
        progressBar.style.backgroundColor = '#e74c3c';
        showNotification('Translation failed: ' + error.message, 'error');
    });
}

function updateTranslationDisplay() {
    console.log('🔄 Mise à jour de l\'affichage de traduction...');
    console.log('📝 Nombre de segments traduits:', translatedSegments.length);
    console.log('📋 Segments traduits:', translatedSegments);
    
    // Afficher la section de résultat de traduction
    const translationResult = document.getElementById('translationResult');
    if (translationResult) {
        translationResult.style.display = 'block';
        console.log('✅ Section translationResult affichée');
    }
    
    // Masquer la section de progression
    const translationProgress = document.getElementById('translationProgress');
    if (translationProgress) {
        translationProgress.style.display = 'none';
    }
    
    updateTranslationSegments();
}

function updateTranslationDisplayWithoutHidingProgress() {
    console.log('🔄 Mise à jour de l\'affichage de traduction (sans masquer la progression)...');
    console.log('📝 Nombre de segments traduits:', translatedSegments.length);
    console.log('📋 Segments traduits:', translatedSegments);
    
    // Afficher la section de résultat de traduction
    const translationResult = document.getElementById('translationResult');
    if (translationResult) {
        translationResult.style.display = 'block';
        console.log('✅ Section translationResult affichée');
    }
    
    // NE PAS masquer la section de progression
    updateTranslationSegments();
}

function updateTranslationSegments() {
    updateTranslationSegmentsOnly();
}

function updateTranslationSegmentsOnly() {
    // Afficher la section de résultat de traduction si elle n'est pas déjà visible
    const translationResult = document.getElementById('translationResult');
    if (translationResult && translationResult.style.display === 'none') {
        translationResult.style.display = 'block';
        console.log('✅ Section translationResult affichée');
    }
    
    const container = document.getElementById('translatedSegments');
    if (!container) {
        console.error('❌ Container translatedSegments non trouvé!');
        return;
    }
    
    console.log('📦 Container trouvé, vidage...');
    container.innerHTML = '';

    translatedSegments.forEach((segment, index) => {
        console.log(`📄 Traitement du segment ${index}:`, segment);
        if (!segment) {
            console.log(`⚠️ Segment ${index} vide, ignoré`);
            return; // Ignorer les segments vides
        }
        if (!segment) return; // Ignorer les segments vides
        
        const segmentDiv = document.createElement('div');
        segmentDiv.className = 'segment';
        segmentDiv.setAttribute('data-start', segment.start);
        segmentDiv.setAttribute('data-end', segment.end);
        segmentDiv.innerHTML = `
            <div class="segment-header">
                <span class="segment-time">${formatTime(segment.start)} - ${formatTime(segment.end)}</span>
                <span class="segment-number">#${index + 1}</span>
            </div>
            <div class="segment-original">${segment.text}</div>
            <textarea class="segment-translation" data-index="${index}">${segment.translatedText || ''}</textarea>
        `;
        
        // Ajouter l'événement de clic pour sauter à la position dans la vidéo
        segmentDiv.addEventListener('click', () => {
            const video = document.getElementById('previewVideo');
            if (video && segment.start !== undefined) {
                video.currentTime = segment.start;
                video.play();
                
                // Mettre en surbrillance le segment actif
                document.querySelectorAll('.segment').forEach(s => s.classList.remove('active'));
                segmentDiv.classList.add('active');
            }
        });
        
        // Ajouter l'événement pour sauvegarder automatiquement les modifications
        const textarea = segmentDiv.querySelector('.segment-translation');
        if (textarea) {
            textarea.addEventListener('input', () => {
                // Mettre à jour le segment dans translatedSegments
                const segmentIndex = parseInt(textarea.getAttribute('data-index'));
                if (translatedSegments[segmentIndex]) {
                    translatedSegments[segmentIndex].translatedText = textarea.value;
                    
                    // Afficher un indicateur de sauvegarde
                    showSaveIndicator();
                    
                    // Sauvegarder automatiquement les modifications
                    saveProjectChanges();
                }
            });
        }
        
        container.appendChild(segmentDiv);
    });
}

function applySubtitles() {
    if (!currentProject) {
        alert('Veuillez d\'abord créer un projet.');
        return;
    }
    
    if (!translatedSegments.length && !currentSegments.length) {
        alert('Veuillez d\'abord effectuer la transcription et/ou la traduction.');
        return;
    }

    const outputFilename = document.getElementById('outputFilename').value || 'video_with_subtitles.mp4';
    const exportProgress = document.getElementById('exportProgress');
    const exportResult = document.getElementById('exportResult');

    exportProgress.style.display = 'block';
    exportResult.style.display = 'none';

    // Récupérer les modifications faites dans l'interface
    const updatedSegments = getUpdatedSegmentsFromInterface();
    
    // Créer d'abord un fichier SRT temporaire
    const srtContent = generateSRTContent(updatedSegments);
    
    fetch('/api/apply-subtitles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            projectId: currentProject.id,
            outputFilename: outputFilename
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            exportProgress.style.display = 'none';
            exportResult.style.display = 'block';
            
            // Stocker le nom du fichier exporté
            currentExportedVideoFilename = data.outputFilename;
            document.getElementById('exportedFileName').textContent = data.outputFilename;
            
            // Créer les boutons de téléchargement
            const downloadButtons = document.querySelector('.download-buttons');
            if (downloadButtons) {
                // Supprimer les anciens boutons
                downloadButtons.innerHTML = '';
                
                // Créer le bouton de téléchargement
                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'btn btn-primary';
                downloadBtn.id = 'downloadVideo';
                downloadBtn.innerHTML = '<i class="fas fa-download"></i> Download Video';
                downloadBtn.setAttribute('data-filename', data.outputFilename);
                
                // Ajouter le bouton
                downloadButtons.appendChild(downloadBtn);
                
                console.log('Download buttons created for:', data.outputFilename);
                showNotification('Video ready for download!', 'success');
                
            } else {
                console.error('Download buttons container not found!');
                showNotification('Download buttons container not found!', 'error');
            }
        } else {
            throw new Error(data.error);
        }
    })
    .catch(error => {
        const progressText = document.getElementById('exportProgressText');
        if (progressText) {
            progressText.textContent = 'Export failed: ' + error.message;
        }
    });
}

function downloadSRT() {
    if (!translatedSegments.length) {
        alert('Please translate segments first.');
        return;
    }

    // Récupérer les modifications faites dans l'interface
    const updatedSegments = getUpdatedSegmentsFromInterface();
    
    const filename = document.getElementById('outputFilename').value || 'subtitles';
    const srtContent = generateSRTContent(updatedSegments);

    fetch('/api/save-subtitles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            segments: updatedSegments,
            filename: filename
        })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.srt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotification('SRT file downloaded with your modifications!', 'success');
    })
    .catch(error => {
        showNotification('Download failed: ' + error.message, 'error');
    });
}

function getUpdatedSegmentsFromInterface() {
    // Récupérer les segments avec les modifications de l'interface
    const updatedSegments = [];
    const textareas = document.querySelectorAll('.segment-translation');
    
    textareas.forEach((textarea, index) => {
        const segmentIndex = parseInt(textarea.getAttribute('data-index'));
        const originalSegment = translatedSegments[segmentIndex];
        
        if (originalSegment) {
            updatedSegments[segmentIndex] = {
                ...originalSegment,
                translatedText: textarea.value.trim()
            };
        }
    });
    
    // Remplir les segments manquants
    for (let i = 0; i < translatedSegments.length; i++) {
        if (!updatedSegments[i]) {
            updatedSegments[i] = translatedSegments[i];
        }
    }
    
    return updatedSegments;
}

function generateSRTContent(segments) {
    return segments
        .filter(segment => segment && (segment.translatedText || segment.text)) // Filtrer les segments vides
        .map((segment, index) => {
            const text = segment.translatedText || segment.text || '';
            // Nettoyer le texte des caractères problématiques
            const cleanText = text
                .replace(/\r\n/g, '\n')
                .replace(/\r/g, '\n')
                .replace(/\n+/g, '\n')
                .trim();
            
            return `${index + 1}\n${formatTime(segment.start)} --> ${formatTime(segment.end)}\n${cleanText}\n`;
        })
        .join('\n');
}

function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
}

function checkOllamaStatus() {
    fetch('/api/config')
        .then(response => response.json())
        .then(config => {
            const statusElement = document.getElementById('ollamaStatus');
            if (statusElement) {
                statusElement.textContent = `Ollama: ${config.ollamaModel} (${config.ollamaBaseUrl})`;
            }
        })
        .catch(error => {
            console.error('Failed to check Ollama status:', error);
        });
}

// Fonction de téléchargement vidéo - Méthode 1 (streaming)
function downloadVideoMethod1() {
    const filename = getCurrentVideoFilename();
    if (!filename) {
        showNotification('No video file available for download', 'error');
        return;
    }
    
    showNotification('Starting download (method 1)...', 'info');
    
    // Créer un lien de téléchargement temporaire
    const downloadLink = document.createElement('a');
    downloadLink.href = `/api/download/video/${encodeURIComponent(filename)}`;
    downloadLink.download = filename;
    downloadLink.target = '_blank';
    downloadLink.style.display = 'none';
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    showNotification('Download started (method 1)', 'success');
}



// Fonction utilitaire pour récupérer le nom du fichier vidéo actuel
function getCurrentVideoFilename() {
    console.log('Recherche du nom de fichier vidéo...');
    
    // Vérifier d'abord la variable globale
    if (currentExportedVideoFilename) {
        console.log('Nom de fichier trouvé dans la variable globale:', currentExportedVideoFilename);
        return currentExportedVideoFilename;
    }
    
    // Essayer de récupérer depuis le bouton de téléchargement
    const downloadBtn = document.getElementById('downloadVideo');
    
    if (downloadBtn && downloadBtn.getAttribute('data-filename')) {
        const filename = downloadBtn.getAttribute('data-filename');
        console.log('Nom de fichier trouvé dans downloadBtn:', filename);
        return filename;
    }
    
    // Essayer de récupérer depuis l'élément exportedFileName
    const exportedFileName = document.getElementById('exportedFileName');
    if (exportedFileName && exportedFileName.textContent && exportedFileName.textContent.trim()) {
        const filename = exportedFileName.textContent.trim();
        console.log('Nom de fichier trouvé dans exportedFileName:', filename);
        return filename;
    }
    
    // Essayer de récupérer depuis le bouton créé dynamiquement
    const downloadButtons = document.querySelector('.download-buttons');
    if (downloadButtons) {
        const button = downloadButtons.querySelector('button[data-filename]');
        if (button) {
            const filename = button.getAttribute('data-filename');
            console.log('Nom de fichier trouvé dans le bouton dynamique:', filename);
            return filename;
        }
    }
    
    console.log('Aucun nom de fichier trouvé');
    return null;
}
