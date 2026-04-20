/**
 * Clean script - removes build artifacts
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const itemsToRemove = ['dist', 'extension.zip']

console.log('Cleaning build artifacts...')

for (const item of itemsToRemove) {
  const itemPath = path.join(rootDir, item)
  
  try {
    if (fs.existsSync(itemPath)) {
      fs.rmSync(itemPath, { recursive: true, force: true })
      console.log(`✓ Removed ${item}/`)
    }
  } catch (error) {
    console.error(`✗ Failed to remove ${item}:`, error)
  }
}

console.log('✅ Clean complete!')
