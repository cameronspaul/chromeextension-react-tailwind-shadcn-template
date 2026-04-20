/**
 * Post-build script - copies manifest.json and icons to dist folder
 * Works on all platforms (Windows, macOS, Linux)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

console.log('Running post-build tasks...')

// Copy manifest.json
const sourceManifest = path.join(rootDir, 'public', 'manifest.json')
const targetManifest = path.join(rootDir, 'dist', 'manifest.json')

try {
  fs.copyFileSync(sourceManifest, targetManifest)
  console.log('✓ Copied manifest.json to dist/')
} catch (error) {
  console.error('✗ Failed to copy manifest.json:', error)
  process.exit(1)
}

// Copy icons if they exist
const sourceIcons = path.join(rootDir, 'public', 'icons')
const targetIcons = path.join(rootDir, 'dist', 'icons')

if (fs.existsSync(sourceIcons)) {
  try {
    // Create target directory if it doesn't exist
    if (!fs.existsSync(targetIcons)) {
      fs.mkdirSync(targetIcons, { recursive: true })
    }
    
    // Copy all files from icons folder
    const files = fs.readdirSync(sourceIcons)
    for (const file of files) {
      const srcFile = path.join(sourceIcons, file)
      const destFile = path.join(targetIcons, file)
      fs.copyFileSync(srcFile, destFile)
    }
    console.log(`✓ Copied ${files.length} icon(s) to dist/icons/`)
  } catch (error) {
    console.error('✗ Failed to copy icons:', error)
  }
} else {
  console.log('⚠ No icons folder found at public/icons/')
  console.log('  Create icons at: public/icons/icon16.png, icon32.png, icon48.png, icon128.png')
}

// Fix HTML entry paths (remove src/entries prefix)
const entriesDir = path.join(rootDir, 'dist', 'src', 'entries')
if (fs.existsSync(entriesDir)) {
  try {
    const entries = fs.readdirSync(entriesDir)
    for (const entry of entries) {
      const entryPath = path.join(entriesDir, entry)
      const targetPath = path.join(rootDir, 'dist', `${entry}.html`)
      
      if (fs.statSync(entryPath).isDirectory()) {
        const htmlFile = path.join(entryPath, 'index.html')
        if (fs.existsSync(htmlFile)) {
          fs.copyFileSync(htmlFile, targetPath)
        }
      }
    }
    console.log('✓ Fixed HTML entry paths')
  } catch (error) {
    console.error('✗ Failed to fix HTML paths:', error)
  }
}

console.log('\n✅ Build complete! Load the dist/ folder in Chrome as an unpacked extension.')
