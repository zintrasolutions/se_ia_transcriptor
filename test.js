// Test simple pour Privacy IA Local Transcriptor
const fs = require('fs');
const path = require('path');

console.log('🧪 Test de Privacy IA Local Transcriptor...\n');

// Test 1: Vérifier les fichiers essentiels
const requiredFiles = [
    'server.js',
    'package.json',
    'public/index.html',
    'public/styles.css',
    'public/script.js',
    'README.md'
];

console.log('📁 Vérification des fichiers essentiels:');
let allFilesExist = true;
requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
});

// Test 2: Vérifier les dossiers
const requiredDirs = [
    'uploads',
    'subtitles',
    'output',
    'public'
];

console.log('\n📂 Vérification des dossiers:');
requiredDirs.forEach(dir => {
    const exists = fs.existsSync(dir);
    console.log(`  ${exists ? '✅' : '❌'} ${dir}/`);
});

// Test 3: Vérifier les dépendances
console.log('\n📦 Vérification des dépendances:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
    'express',
    'multer',
    'cors',
    'fluent-ffmpeg',
    'openai',
    'axios',
    'uuid',
    'fs-extra'
];

requiredDeps.forEach(dep => {
    const exists = packageJson.dependencies && packageJson.dependencies[dep];
    console.log(`  ${exists ? '✅' : '❌'} ${dep}`);
});

// Test 4: Vérifier la configuration
console.log('\n⚙️  Vérification de la configuration:');
const envExampleExists = fs.existsSync('env.example');
console.log(`  ${envExampleExists ? '✅' : '❌'} env.example`);

const envExists = fs.existsSync('.env');
console.log(`  ${envExists ? '✅' : '❌'} .env ${envExists ? '(configuré)' : '(à créer)'}`);

// Résumé
console.log('\n📊 Résumé:');
if (allFilesExist) {
    console.log('✅ Tous les fichiers essentiels sont présents');
    console.log('✅ L\'application est prête à être utilisée');
    console.log('\n🚀 Pour démarrer:');
    console.log('   npm start');
    console.log('   ou');
    console.log('   ./start.sh (Linux/Mac)');
    console.log('   ou');
    console.log('   start.bat (Windows)');
} else {
    console.log('❌ Certains fichiers sont manquants');
    console.log('   Veuillez vérifier l\'installation');
}

console.log('\n📝 Prochaines étapes:');
console.log('1. Configurez votre clé API OpenAI dans .env');
console.log('2. Installez et démarrez Ollama');
console.log('3. Installez FFmpeg');
console.log('4. Démarrez l\'application');
