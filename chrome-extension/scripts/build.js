#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

console.log('🔨 Building DOM Agent Chrome Extension...\n');

// Clean previous build
console.log('🧹 Cleaning previous build...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
console.log('✅ Clean completed\n');

// Build the extension
console.log('📦 Building extension...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Validate build output
console.log('🔍 Validating build output...');
const requiredFiles = [
  'manifest.json',
  'background.js',
  'content.js',
  'popup.html',
  'devtools.html',
  'devtools-panel.html'
];

let missingFiles = [];
requiredFiles.forEach(file => {
  if (!fs.existsSync(path.join('dist', file))) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.error('❌ Missing required files in dist/:', missingFiles.join(', '));
  process.exit(1);
}

console.log('✅ All required files present\n');

// Package for distribution
console.log('📦 Creating distribution package...');
const packageName = `dom-agent-chrome-v${require('../package.json').version}.zip`;
const output = fs.createWriteStream(packageName);
const archive = archiver('zip', {
  zlib: { level: 9 } // Sets the compression level
});

output.on('close', () => {
  const size = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✅ Package created: ${packageName} (${size} MB)`);
});

archive.on('error', (err) => {
  throw err;
});

archive.pipe(output);
archive.directory('dist/', false);
archive.finalize();

console.log('🎉 Build and packaging completed successfully!');
console.log('\n📋 Distribution files:');
console.log(`   - Built extension: dist/`);
console.log(`   - Package: ${packageName}`);
console.log('\n📖 Ready for Chrome Web Store submission or manual installation');
