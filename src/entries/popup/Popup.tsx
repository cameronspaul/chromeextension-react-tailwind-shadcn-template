import { useEffect } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { initPaymentListeners } from '../../stores/usePaymentStore'
import { PaymentStatus, PaymentGate } from '../../components/payment'
import { Sun, Moon, ExternalLink, Sparkles } from 'lucide-react'
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

  // Initialize payment listeners
  useEffect(() => {
    const cleanup = initPaymentListeners()
    return cleanup
  }, [])

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
          <img src="/icons/icon.svg" alt="Extension Icon" className="w-8 h-8" />
          <span className="font-semibold text-sm">Extension</span>
        </div>
        <div className="flex items-center gap-2">
          <PaymentStatus />
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
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-lg font-semibold">Welcome</h1>
          <p className="text-sm text-muted-foreground">
            Your extension is ready to use.
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

        {/* Premium Features Demo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5" />
            Premium Features
          </h2>

          <PaymentGate showPaymentButton allowTrial>
            <div className="p-3 rounded-lg border border-green-500/30 bg-green-500/5 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">AI Assistant</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Unlimited Bookmarks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm font-medium">Cloud Sync</span>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                All premium features are active!
              </p>
            </div>
          </PaymentGate>
        </motion.div>

      </main>

    </div>
  )
}

export default Popup
