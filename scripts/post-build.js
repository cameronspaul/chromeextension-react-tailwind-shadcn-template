/**
 * Post-build script - copies manifest.json, icons to dist folder and creates extension.zip
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

// Fix HTML entry paths (remove src/entries prefix and fix relative paths)
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
          // Read the HTML content and fix the paths
          let htmlContent = fs.readFileSync(htmlFile, 'utf8')
          // Replace ../../../ with ./ for correct relative paths from dist root
          htmlContent = htmlContent.replace(/\.\.\/\.\.\/\.\.\//g, './')
          fs.writeFileSync(targetPath, htmlContent)
        }
      }
    }
    console.log('✓ Fixed HTML entry paths')
  } catch (error) {
    console.error('✗ Failed to fix HTML paths:', error)
  }
}

console.log('\n✅ Build complete! Load the dist/ folder in Chrome as an unpacked extension.')

const { execSync } = await import('child_process')

const zipPath = path.join(rootDir, 'extension.zip')
const distPath = path.join(rootDir, 'dist')

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath)
}

if (process.platform !== 'win32') {
  try {
    execSync(`cd "${distPath}" && zip -r "${zipPath}" . -x "*.map"`, { stdio: 'inherit' })
    console.log('✅ Created extension.zip')
    process.exit(0)
  } catch {
    console.log('⚠ Failed to create zip with native command')
  }
} else {
  console.log('⚠ Automatic zipping not available on Windows without additional tools.')
  console.log('  Please manually zip the contents of the dist/ folder.')
}
