import { useEffect } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { Sun, Moon, Save, RotateCcw, Info } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { motion } from 'framer-motion'

/**
 * Options Component - Full settings page for the extension
 * 
 * Accessed via:
 * - Right-click extension icon → Options
 * - chrome://extensions/ → Details → Extension options
 * - Popup menu → Settings button
 */
function Options() {
  const { theme, toggleTheme } = useAppStore()

  // Set theme on document
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/icons/icon.svg" alt="Extension Icon" className="w-10 h-10 rounded-xl" />
            <div>
              <h1 className="text-xl font-semibold">Extension Settings</h1>
              <p className="text-sm text-muted-foreground">
                Customize your extension experience
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </motion.div>
              <span className="text-sm font-medium capitalize">{theme} Mode</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Appearance Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Sun className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold">Appearance</h2>
            </div>
            
            <div className="border border-border rounded-xl bg-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color scheme
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                  <button
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      theme === 'light' 
                        ? 'bg-background shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                      theme === 'dark' 
                        ? 'bg-background shadow-sm' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Accent Color</p>
                  <p className="text-sm text-muted-foreground">
                    Primary color used throughout the extension
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {['blue', 'green', 'purple', 'orange', 'red'].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full bg-${color}-500 border-2 transition-all hover:scale-110`}
                      style={{ 
                        backgroundColor: 
                          color === 'blue' ? '#3b82f6' :
                          color === 'green' ? '#22c55e' :
                          color === 'purple' ? '#a855f7' :
                          color === 'orange' ? '#f97316' :
                          '#ef4444'
                      }}
                      onClick={() => {
                        // TODO: Implement accent color change
                        console.log('Change accent color to', color)
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* General Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Info className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold">General Settings</h2>
            </div>
            
            <div className="border border-border rounded-xl bg-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Display notifications when actions are completed
                  </p>
                </div>
                <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-sync Data</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync data across devices
                  </p>
                </div>
                <div className="w-11 h-6 bg-muted rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Keyboard Shortcuts</p>
                  <p className="text-sm text-muted-foreground">
                    Enable keyboard shortcuts for quick actions
                  </p>
                </div>
                <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            </div>
          </motion.section>

          {/* Data Management */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Save className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-semibold">Data Management</h2>
            </div>
            
            <div className="border border-border rounded-xl bg-card p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download all your extension data as JSON
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">Import Data</p>
                  <p className="text-sm text-muted-foreground">
                    Import data from a previous export
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Import
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <div>
                  <p className="font-medium text-red-600">Reset All Data</p>
                  <p className="text-sm text-red-600/70">
                    Clear all extension data and settings
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </motion.section>

          {/* Extension Info */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-8 border-t border-border"
          >
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="space-y-1">
                <p>React Chrome Extension Template</p>
                <p>Version 1.0.0</p>
              </div>
              <div className="space-y-1 text-right">
                <p>Built with React 19 + Vite + Tailwind</p>
                <p>Chrome Extension Manifest V3</p>
              </div>
            </div>
          </motion.footer>
        </div>
      </main>
    </div>
  )
}

export default Options
