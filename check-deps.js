#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function checkDependency(name, command, description = '') {
    try {
        await execAsync(command);
        console.log(`✅ ${name} - OK`);
        return true;
    } catch (error) {
        console.log(`❌ ${name} - NOT FOUND`);
        if (description) {
            console.log(`   ${description}`);
        }
        return false;
    }
}

async function checkOllamaModel(modelName) {
    try {
        const { stdout } = await execAsync('ollama list');
        if (stdout.includes(modelName)) {
            console.log(`✅ Ollama model ${modelName} - OK`);
            return true;
        } else {
            console.log(`❌ Ollama model ${modelName} - NOT FOUND`);
            console.log(`   Run: ollama pull ${modelName}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Ollama model ${modelName} - ERROR`);
        return false;
    }
}

async function main() {
    console.log('🔍 Vérification des dépendances SEIA Translator');
    console.log('==============================================\n');

    const results = [];

    // Vérifier FFmpeg
    results.push(await checkDependency('FFmpeg', 'ffmpeg -version', 'Install with: brew install ffmpeg'));

    // Vérifier Ollama
    results.push(await checkDependency('Ollama', 'ollama --version', 'Install with: brew install ollama'));

    // Vérifier Whisper
    results.push(await checkDependency('Whisper', 'whisper --help', 'Install with: pip3 install openai-whisper'));

    // Vérifier le modèle llama3.1
    results.push(await checkOllamaModel('llama3.1'));

    // Vérifier Node.js
    results.push(await checkDependency('Node.js', 'node --version', 'Download from: https://nodejs.org'));

    // Vérifier npm
    results.push(await checkDependency('npm', 'npm --version', 'Comes with Node.js'));

    console.log('\n📊 Résumé');
    console.log('==========');
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(`${passed}/${total} dépendances installées`);
    
    if (passed === total) {
        console.log('🎉 Toutes les dépendances sont installées !');
        console.log('Vous pouvez maintenant démarrer l\'application avec: npm run electron');
    } else {
        console.log('⚠️  Certaines dépendances manquent.');
        console.log('Exécutez le script d\'installation: npm run install-macos');
    }
}

main().catch(console.error);
