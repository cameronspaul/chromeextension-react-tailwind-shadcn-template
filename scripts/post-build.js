import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const isWatch = process.argv.includes('--watch')

function runPostBuild() {
  const sourceManifest = path.join(rootDir, 'public', 'manifest.json')
  const targetManifest = path.join(rootDir, 'dist', 'manifest.json')

  try {
    fs.copyFileSync(sourceManifest, targetManifest)
    console.log('✓ Copied manifest.json to dist/')
  } catch (error) {
    console.error('✗ Failed to copy manifest.json:', error)
    return
  }

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
      console.log(`✓ Copied ${files.length} icon(s) to dist/icons/`)
    } catch (error) {
      console.error('✗ Failed to copy icons:', error)
    }
  } else {
    console.log('⚠ No icons folder found at public/icons/')
  }

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
            let htmlContent = fs.readFileSync(htmlFile, 'utf8')
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

  console.log('✅ Post-build complete!')
}

if (!isWatch) {
  console.log('Running post-build tasks...')
  runPostBuild()

  const { execSync } = await import('child_process')
  const zipPath = path.join(rootDir, 'extension.zip')
  const distPath = path.join(rootDir, 'dist')

  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath)

  if (process.platform !== 'win32') {
    try {
      execSync(`cd "${distPath}" && zip -r "${zipPath}" . -x "*.map"`, { stdio: 'inherit' })
      console.log('✅ Created extension.zip')
    } catch {
      console.log('⚠ Failed to create zip with native command')
    }
  } else {
    console.log('⚠ Automatic zipping not available on Windows without additional tools.')
  }
} else {
  const { default: chokidar } = await import('chokidar')

  console.log('🔄 Starting dev watch mode...')

  let debounceTimer = null
  let isRunning = false
  let viteProcess = null

  async function runViteBuild() {
    const { spawn } = await import('child_process')
    return new Promise((resolve) => {
      if (viteProcess) viteProcess.kill()
      viteProcess = spawn('npx', ['vite', 'build'], {
        cwd: rootDir,
        stdio: 'inherit',
        shell: true,
      })
      viteProcess.on('exit', (code) => {
        if (code === 0) resolve(true)
        else resolve(false)
      })
    })
  }

  const watcher = chokidar.watch(
    [path.join(rootDir, 'public'), path.join(rootDir, 'src'), path.join(rootDir, 'index.html')],
    {
      ignoreInitial: true,
      ignored: [/\.git/, /node_modules/],
      awaitWriteFinish: { stabilityThreshold: 500, pollInterval: 100 },
    },
  )

  watcher.on('all', async () => {
    if (isRunning) return
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      isRunning = true
      console.log('\n🔄 Source changed, rebuilding...')
      const success = await runViteBuild()
      if (success) {
        runPostBuild()
      }
      isRunning = false
    }, 1000)
  })

  process.on('SIGINT', () => {
    watcher.close()
    process.exit(0)
  })

  console.log('👀 Watching for changes... (Ctrl+C to stop)')
}
