#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up DOM Agent Chrome Extension...\n');

// Check if we're in the right directory
if (!fs.existsSync('package.json')) {
  console.error('❌ Error: package.json not found. Please run this script from the chrome-extension directory.');
  process.exit(1);
}

// Check Node.js version
const nodeVersion = process.version;
console.log(`📋 Node.js version: ${nodeVersion}`);

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully\n');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}

// Create necessary directories if they don't exist
const dirs = [
  'src/background',
  'src/content',
  'src/popup',
  'src/devtools',
  'src/utils',
  'src/types',
  'src/components/ui',
  'src/components/dom-inspector',
  'src/components/code-generator',
  'public/icons',
  'dist'
];

console.log('📁 Creating directories...');
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`  ✅ Created ${dir}`);
  } else {
    console.log(`  ⏭️  ${dir} already exists`);
  }
});

// Check if manifest.json exists
if (!fs.existsSync('public/manifest.json')) {
  console.log('\n⚠️  Warning: manifest.json not found in public/ directory');
  console.log('   Please ensure you have created the manifest.json file');
}

// Check if icons exist
const iconFiles = [
  'public/icons/icon16.png',
  'public/icons/icon32.png',
  'public/icons/icon48.png',
  'public/icons/icon128.png'
];

let missingIcons = [];
iconFiles.forEach(icon => {
  if (!fs.existsSync(icon)) {
    missingIcons.push(icon);
  }
});

if (missingIcons.length > 0) {
  console.log('\n⚠️  Warning: Missing icon files:');
  missingIcons.forEach(icon => console.log(`   - ${icon}`));
  console.log('   Please create these icon files for the extension');
}

// Build the extension
console.log('\n🔨 Building extension...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Extension built successfully\n');
} catch (error) {
  console.error('❌ Error building extension:', error.message);
  process.exit(1);
}

// Check if dist directory has content
const distFiles = fs.readdirSync('dist');
if (distFiles.length === 0) {
  console.error('❌ Error: dist directory is empty. Build may have failed.');
  process.exit(1);
}

console.log('🎉 Setup completed successfully!');
console.log('\n📋 Next steps:');
console.log('1. Load the extension in Chrome:');
console.log('   - Open chrome://extensions/');
console.log('   - Enable "Developer mode"');
console.log('   - Click "Load unpacked"');
console.log('   - Select the "dist" folder');
console.log('\n2. Test the extension on a webpage');
console.log('\n3. For development:');
console.log('   - Run "npm run dev" for watch mode');
console.log('   - Make changes in src/ directory');
console.log('   - Reload the extension in Chrome');

console.log('\n📖 For more information, see README.md');

if (missingIcons.length > 0) {
  console.log('\n💡 Tip: Create icon files for a better user experience');
}
