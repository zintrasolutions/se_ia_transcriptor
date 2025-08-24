#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

async function testExternalTools() {
    console.log('🔍 Test d\'accès aux outils externes...\n');
    
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
    
    console.log('🔍 PATH système:', env.PATH);
    console.log('');
    
    const tools = [
        { name: 'FFmpeg', command: 'ffmpeg -version', description: 'Traitement vidéo' },
        { name: 'Whisper', command: 'whisper --help', description: 'Transcription audio' },
        { name: 'Ollama', command: 'ollama --version', description: 'Modèles de langage' }
    ];
    
    const results = [];
    
    for (const tool of tools) {
        try {
            console.log(`🧪 Test de ${tool.name} (${tool.description})...`);
            const { stdout, stderr } = await execAsync(tool.command, { env });
            
            if (stdout) {
                console.log(`✅ ${tool.name} accessible`);
                console.log(`   Sortie: ${stdout.split('\n')[0]}`);
                results.push({ tool: tool.name, status: 'OK', output: stdout.split('\n')[0] });
            } else if (stderr) {
                console.log(`⚠️ ${tool.name} accessible (stderr)`);
                console.log(`   Sortie: ${stderr.split('\n')[0]}`);
                results.push({ tool: tool.name, status: 'WARNING', output: stderr.split('\n')[0] });
            }
        } catch (error) {
            console.log(`❌ ${tool.name} non accessible`);
            console.log(`   Erreur: ${error.message}`);
            results.push({ tool: tool.name, status: 'ERROR', output: error.message });
        }
        console.log('');
    }
    
    // Résumé
    console.log('📊 Résumé des tests:');
    console.log('===================');
    
    const okCount = results.filter(r => r.status === 'OK').length;
    const warningCount = results.filter(r => r.status === 'WARNING').length;
    const errorCount = results.filter(r => r.status === 'ERROR').length;
    
    results.forEach(result => {
        const icon = result.status === 'OK' ? '✅' : result.status === 'WARNING' ? '⚠️' : '❌';
        console.log(`${icon} ${result.tool}: ${result.status}`);
    });
    
    console.log('');
    console.log(`📈 Résultats: ${okCount} OK, ${warningCount} Warnings, ${errorCount} Erreurs`);
    
    if (errorCount === 0) {
        console.log('🎉 Tous les outils sont accessibles !');
        return true;
    } else {
        console.log('⚠️ Certains outils ne sont pas accessibles.');
        console.log('💡 Vérifiez que les outils sont installés et dans le PATH.');
        return false;
    }
}

// Test spécifique pour Ollama HTTP
async function testOllamaHTTP() {
    console.log('🌐 Test de connexion Ollama HTTP...');
    
    try {
        const { default: axios } = await import('axios');
        const response = await axios.get('http://localhost:11434/api/tags', { timeout: 5000 });
        console.log('✅ Ollama HTTP accessible');
        console.log(`   Modèles disponibles: ${response.data.models?.length || 0}`);
        return true;
    } catch (error) {
        console.log('❌ Ollama HTTP non accessible');
        console.log(`   Erreur: ${error.message}`);
        console.log('💡 Démarrez Ollama avec: ollama serve');
        return false;
    }
}

// Exécuter les tests
async function runTests() {
    console.log('🚀 Test d\'accès aux outils externes pour SEIA Translator\n');
    
    const toolsOk = await testExternalTools();
    console.log('');
    const ollamaOk = await testOllamaHTTP();
    
    console.log('\n🎯 Conclusion:');
    if (toolsOk && ollamaOk) {
        console.log('✅ L\'application Electron devrait pouvoir accéder à tous les outils externes');
    } else {
        console.log('⚠️ Certains outils ne sont pas accessibles');
        console.log('💡 Vérifiez l\'installation et la configuration');
    }
}

if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testExternalTools, testOllamaHTTP };
