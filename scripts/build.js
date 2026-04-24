import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const isWatch = process.argv.includes('--watch')
const isProduction = process.argv.includes('--production')

function getPackageName() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'))
    return pkg.name || 'extension'
  } catch {
    return 'extension'
  }
}

function copyPublicFiles() {
  // Copy manifest.json
  const sourceManifest = path.join(rootDir, 'public', 'manifest.json')
  const targetManifest = path.join(rootDir, 'dist', 'manifest.json')

  try {
    fs.copyFileSync(sourceManifest, targetManifest)
    console.log('✓ Copied manifest.json')
  } catch (error) {
    console.error('✗ Failed to copy manifest.json:', error.message)
  }

  // Copy icons
  const sourceIcons = path.join(rootDir, 'public', 'icons')
  const targetIcons = path.join(rootDir, 'dist', 'icons')

  if (fs.existsSync(sourceIcons)) {
    try {
      if (!fs.existsSync(targetIcons)) {
        fs.mkdirSync(targetIcons, { recursive: true })
      }
      const files = fs.readdirSync(sourceIcons)
      for (const file of files) {
        fs.copyFileSync(path.join(sourceIcons, file), path.join(targetIcons, file))
      }
      console.log(`✓ Copied ${files.length} icon(s)`)
    } catch (error) {
      console.error('✗ Failed to copy icons:', error.message)
    }
  }
}

function fixHtmlPaths() {
  const entriesDir = path.join(rootDir, 'dist', 'src', 'entries')
  if (!fs.existsSync(entriesDir)) return

  try {
    const entries = fs.readdirSync(entriesDir)
    for (const entry of entries) {
      const entryPath = path.join(entriesDir, entry)
      const targetPath = path.join(rootDir, 'dist', `${entry}.html`)
      if (fs.statSync(entryPath).isDirectory()) {
        const htmlFile = path.join(entryPath, 'index.html')
        if (fs.existsSync(htmlFile)) {
          let htmlContent = fs.readFileSync(htmlFile, 'utf8')
          htmlContent = htmlContent.replace(/\.\.\/\.\.\/\.\.\//g, './')
          fs.writeFileSync(targetPath, htmlContent)
        }
      }
    }
    console.log('✓ Fixed HTML entry paths')
  } catch (error) {
    console.error('✗ Failed to fix HTML paths:', error.message)
  }
}

async function runViteBuild(mode = 'development') {
  const { spawn } = await import('child_process')
  return new Promise((resolve) => {
    const proc = spawn('npx', ['vite', 'build', '--mode', mode], {
      cwd: rootDir,
      stdio: 'inherit',
      shell: true,
    })
    proc.on('exit', (code) => resolve(code === 0))
  })
}

async function createZip() {
  const packageName = getPackageName()
  const zipPath = path.join(rootDir, `${packageName}.zip`)
  const distPath = path.join(rootDir, 'dist')

  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath)

  // Use adm-zip if available (cross-platform), fallback to native zip on Unix
  try {
    const { default: AdmZip } = await import('adm-zip')
    const zip = new AdmZip()
    zip.addLocalFolder(distPath)
    zip.writeZip(zipPath)
    console.log(`✅ Created ${packageName}.zip`)
    return
  } catch {
    // adm-zip not available, try native
  }

  if (process.platform !== 'win32') {
    try {
      const { execSync } = await import('child_process')
      execSync(`cd "${distPath}" && zip -r "${zipPath}" . -x "*.map"`, { stdio: 'inherit' })
      console.log(`✅ Created ${packageName}.zip`)
    } catch {
      console.log('⚠ Failed to create zip. Install adm-zip: npm i -D adm-zip')
    }
  } else {
    console.log('⚠ Install adm-zip for automatic zipping: npm i -D adm-zip')
    console.log('   Or manually zip the dist/ folder for Chrome Web Store')
  }
}

function postBuild() {
  copyPublicFiles()
  fixHtmlPaths()
  console.log('✅ Build complete!')
}

// ===== WATCH MODE =====
if (isWatch) {
  const { default: chokidar } = await import('chokidar')

  console.log('🔄 Starting dev mode...')

  let debounceTimer = null
  let isRunning = false
  let viteProcess = null

  async function rebuild() {
    if (isRunning) return
    if (debounceTimer) clearTimeout(debounceTimer)

    debounceTimer = setTimeout(async () => {
      isRunning = true
      console.log('\n🔄 Rebuilding...')
      if (viteProcess) viteProcess.kill()

      const success = await runViteBuild('development')
      if (success) {
        postBuild()
        console.log('👀 Watching for changes... (Ctrl+C to stop)')
      }
      isRunning = false
    }, 500)
  }

  // Initial build
  await rebuild()

  const watcher = chokidar.watch(
    [path.join(rootDir, 'public'), path.join(rootDir, 'src'), path.join(rootDir, 'index.html')],
    {
      ignoreInitial: true,
      ignored: [/\.git/, /node_modules/, /dist/],
    }
  )

  watcher.on('all', rebuild)

  process.on('SIGINT', () => {
    watcher.close()
    if (viteProcess) viteProcess.kill()
    process.exit(0)
  })
}
// ===== ONE-TIME BUILD =====
else {
  console.log(isProduction ? '📦 Production build...' : '🔨 Development build...')

  const success = await runViteBuild(isProduction ? 'production' : 'development')
  if (!success) {
    console.error('❌ Build failed')
    process.exit(1)
  }

  postBuild()

  if (isProduction) {
    await createZip()
  }
}
