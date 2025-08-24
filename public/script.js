// Global variables
let currentVideoPath = null;
let currentSegments = [];
let translatedSegments = [];
let currentVideoElement = null;
let currentExportedVideoFilename = null;

// Language options
const languages = {
    'en': 'English',
    'fr': 'French',
    'es': 'Spanish',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ru': 'Russian',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'no': 'Norwegian',
    'da': 'Danish',
    'fi': 'Finnish',
    'pl': 'Polish',
    'tr': 'Turkish',
    'he': 'Hebrew',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'ms': 'Malay',
    'fa': 'Persian',
    'ur': 'Urdu',
    'bn': 'Bengali',
    'te': 'Telugu',
    'ta': 'Tamil',
    'gu': 'Gujarati',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'pa': 'Punjabi',
    'si': 'Sinhala',
    'my': 'Burmese',
    'km': 'Khmer',
    'lo': 'Lao',
    'ne': 'Nepali',
    'bo': 'Tibetan',
    'mn': 'Mongolian',
    'ka': 'Georgian',
    'hy': 'Armenian',
    'az': 'Azerbaijani',
    'kk': 'Kazakh',
    'ky': 'Kyrgyz',
    'uz': 'Uzbek',
    'tk': 'Turkmen',
    'tg': 'Tajik',
    'ps': 'Pashto',
    'sd': 'Sindhi',
    'si': 'Sinhala',
    'my': 'Burmese',
    'km': 'Khmer',
    'lo': 'Lao',
    'ne': 'Nepali',
    'bo': 'Tibetan',
    'mn': 'Mongolian',
    'ka': 'Georgian',
    'hy': 'Armenian',
    'az': 'Azerbaijani',
    'kk': 'Kazakh',
    'ky': 'Kyrgyz',
    'uz': 'Uzbek',
    'tk': 'Turkmen',
    'tg': 'Tajik',
    'ps': 'Pashto',
    'sd': 'Sindhi'
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeLanguageSelects();
    setupEventListeners();
    checkOllamaStatus();
});

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
    
    // Téléchargement vidéo
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'downloadVideo') {
            e.preventDefault();
            downloadVideoMethod1();
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
            currentVideoPath = data.path;
            progressBar.style.width = '100%';
            progressText.textContent = 'Upload completed!';
            
            setTimeout(() => {
                uploadProgress.style.display = 'none';
                uploadResult.style.display = 'block';
                document.getElementById('uploadedFileName').textContent = data.filename;
                switchTab('transcribe');
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
    if (!currentVideoPath) {
        alert('Please upload a video first.');
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
            videoPath: currentVideoPath,
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
            setTimeout(() => {
                transcriptionProgress.style.display = 'none';
                transcriptionResult.style.display = 'block';
                document.getElementById('segmentCount').textContent = data.transcription.length;
                displayTranscription(data.transcription);
                switchTab('translate');
                showNotification(`Transcription completed! ${data.transcription.length} segments detected`, 'success');
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
    const container = document.getElementById('transcriptionSegments');
    if (!container) {
        console.error('transcriptionSegments container not found');
        return;
    }
    
    container.innerHTML = '';

    segments.forEach((segment, index) => {
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
    });
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
    if (!currentSegments.length) {
        alert('Please transcribe a video or upload an SRT file first.');
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
            segments: currentSegments,
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
                                            updateTranslationDisplay();
                                        }
                                    } else if (data.type === 'complete') {
                                        translatedSegments = data.translatedSegments;
                                        updateTranslationDisplay();
                                        
                                        setTimeout(() => {
                                            translationProgress.style.display = 'none';
                                            translationResult.style.display = 'block';
                                            
                                            // Charger la vidéo dans le lecteur
                                            const video = document.getElementById('previewVideo');
                                            if (video && currentVideoPath) {
                                                video.src = `/api/video/${encodeURIComponent(currentVideoPath)}`;
                                                video.load();
                                            }
                                        }, 1000);
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
    const container = document.getElementById('translatedSegments');
    container.innerHTML = '';

    translatedSegments.forEach((segment, index) => {
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
                }
            });
        }
        
        container.appendChild(segmentDiv);
    });
}

function applySubtitles() {
    if (!translatedSegments.length) {
        alert('Please translate segments first.');
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
            videoPath: currentVideoPath,
            srtContent: srtContent,
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
