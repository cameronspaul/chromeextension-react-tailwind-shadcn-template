import { useEffect } from 'react'
import { useAppStore, initPaymentListeners } from '../../store'
import { PaymentStatus, PaymentGate } from '../../components/Payment'
import { openSidePanel } from '../../lib/messaging'
import { Sun, Moon, ExternalLink, Sparkles, Settings } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { motion } from 'framer-motion'

function Popup() {
  const { theme, toggleTheme } = useAppStore()

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const cleanup = initPaymentListeners()
    return cleanup
  }, [])

  const handleOpenSidePanel = async () => {
    try {
      await openSidePanel()
    } catch (error) {
      console.error('Failed to open side panel:', error)
    } finally {
      window.close()
    }
  }

  return (
    <div className="w-[380px] min-h-[500px] bg-background text-foreground flex flex-col">
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
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </motion.button>
        </div>
      </header>

      <main className="flex-1 p-4 space-y-4">
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
            <Button variant="outline" className="w-full justify-between" onClick={handleOpenSidePanel}>
              <span>Open Side Panel</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button variant="outline" className="w-full justify-between" onClick={() => chrome.runtime.openOptionsPage()}>
              <span>Settings</span>
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>

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
