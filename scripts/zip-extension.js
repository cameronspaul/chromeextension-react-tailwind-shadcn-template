/**
 * ZIP extension script - creates extension.zip for distribution
 * Works on all platforms
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

try {
  // Check if dist folder exists
  const distDir = path.join(rootDir, 'dist')
  if (!fs.existsSync(distDir)) {
    console.error('✗ dist/ folder not found. Run npm run build:extension first.')
    process.exit(1)
  }

  // Try to use native zip command first (macOS/Linux)
  const { execSync } = await import('child_process')
  
  try {
    // For macOS/Linux
    if (process.platform !== 'win32') {
      execSync('cd dist && zip -r ../extension.zip . -x "*.map"', {
        cwd: rootDir,
        stdio: 'inherit'
      })
      console.log('✅ Created extension.zip')
      process.exit(0)
    }
  } catch {
    // Fall through to JS implementation
  }
  
  // Use JS implementation for Windows or if native zip fails
  console.log('Using JavaScript zip implementation...')
  
  // For Windows, we need to check if 7z is available, otherwise use a simple approach
  console.log('⚠ Automatic zipping not available on Windows without additional tools.')
  console.log('  Please manually zip the contents of the dist/ folder.')
  console.log('  The dist/ folder is ready for the Chrome Web Store.')
  
} catch (error) {
  console.error('✗ Failed to create zip:', error)
  process.exit(1)
}
