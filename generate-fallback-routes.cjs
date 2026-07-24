const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');
const ideDir = path.join(distDir, 'ide');

console.log('📦 Kone Code Fallback Router Generator');
console.log('====================================');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory not found. Please run build first.');
  process.exit(1);
}

// Create the ide directory if it doesn't exist
if (!fs.existsSync(ideDir)) {
  fs.mkdirSync(ideDir, { recursive: true });
}

// Check source file: prefer 200.html, fallback to index.html
let sourceFile = path.join(distDir, '200.html');
if (!fs.existsSync(sourceFile)) {
  sourceFile = path.join(distDir, 'index.html');
}

if (!fs.existsSync(sourceFile)) {
  console.error('❌ No source HTML files found in dist to use as fallback.');
  process.exit(1);
}

const destFile = path.join(ideDir, 'index.html');

try {
  fs.copyFileSync(sourceFile, destFile);
  console.log(`✅ Successfully copied fallback from ${path.basename(sourceFile)} to dist/ide/index.html`);
} catch (err) {
  console.error('❌ Failed to copy fallback route:', err.message);
  process.exit(1);
}
