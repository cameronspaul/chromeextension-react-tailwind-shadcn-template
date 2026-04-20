import { useEffect } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { Sun, Moon, ExternalLink } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { motion } from 'framer-motion'

/**
 * Popup Component - Main extension UI that appears when clicking the toolbar icon
 * 
 * Features:
 * - Fully React-based with all your existing features
 * - Theme toggle (light/dark)
 * - Quick actions
 * - Navigation to other extension pages
 */
function Popup() {
  const { theme, toggleTheme } = useAppStore()

  // Set theme on document
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  const openSidePanel = async () => {
    // Open the side panel
    try {
      const currentWindow = await chrome.windows.getCurrent()
      if (currentWindow.id && chrome.sidePanel) {
        await chrome.sidePanel.open({ windowId: currentWindow.id })
        window.close() // Close popup after opening side panel
      }
    } catch (error) {
      console.error('Failed to open side panel:', error)
    }
  }

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
    window.close()
  }

  return (
    <div className="w-[380px] min-h-[500px] bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">RE</span>
          </div>
          <span className="font-semibold text-sm">React Extension</span>
        </div>
        <motion.button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle theme"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </motion.div>
        </motion.button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-lg font-semibold">Welcome to Your Extension</h1>
          <p className="text-sm text-muted-foreground">
            This is a React-based Chrome extension with full feature support.
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={openSidePanel}
              >
                <span>Open Side Panel</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={openOptions}
              >
                <span>Settings</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Features Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Features
          </h2>
          <div className="space-y-2">
            {[
              { name: 'React 19', desc: 'Latest React with concurrent features' },
              { name: 'Tailwind CSS v4', desc: 'Modern utility-first styling' },
              { name: 'shadcn/ui', desc: 'Beautiful component primitives' },
              { name: 'Zustand', desc: 'Simple state management' },
              { name: 'Chrome APIs', desc: 'Full extension API integration' },
              { name: 'TypeScript', desc: 'Type-safe development' },
            ].map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center justify-between p-2 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{feature.name}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-3 bg-card">
        <p className="text-xs text-muted-foreground text-center">
          Built with React + Vite + Tailwind
        </p>
      </footer>
    </div>
  )
}

export default Popup
