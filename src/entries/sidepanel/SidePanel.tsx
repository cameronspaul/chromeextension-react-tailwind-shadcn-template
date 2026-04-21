import { useEffect, useState } from 'react'
import { useAppStore, initPaymentListeners } from '../../store'
import { PaymentStatus, PaymentButton } from '../../components/Payment'
import { Sun, Moon, Globe, Settings } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { motion } from 'framer-motion'

function SidePanel() {
  const { theme, toggleTheme } = useAppStore()
  const [currentUrl, setCurrentUrl] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    const cleanup = initPaymentListeners()
    return cleanup
  }, [])

  useEffect(() => {
    const getCurrentTab = async () => {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      if (tab) {
        setCurrentUrl(tab.url || '')
        setCurrentTitle(tab.title || '')
      }
    }
    getCurrentTab()

    const listener = (_tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      if (tab.active && changeInfo.url) {
        setCurrentUrl(changeInfo.url)
        setCurrentTitle(tab.title || '')
      }
    }

    chrome.tabs.onUpdated.addListener(listener)
    chrome.tabs.onActivated.addListener(getCurrentTab)

    return () => {
      chrome.tabs.onUpdated.removeListener(listener)
      chrome.tabs.onActivated.removeListener(getCurrentTab)
    }
  }, [])

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/icons/icon.svg" alt="Extension Icon" className="w-6 h-6" />
          <span className="font-semibold">Extension</span>
        </div>
        <div className="flex items-center gap-2">
          <PaymentStatus showDetails />
          <motion.button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </motion.button>
          <motion.button
            onClick={() => chrome.runtime.openOptionsPage()}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="h-4 w-4" />
          </motion.button>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 space-y-4">
        <div className="border border-border rounded-xl bg-card p-4 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Current Page
          </h2>
          
          <div className="space-y-2">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Title</p>
              <p className="text-sm font-medium line-clamp-2">{currentTitle || 'No page active'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">URL</p>
              <p className="text-xs font-mono bg-muted p-2 rounded break-all">{currentUrl || 'No URL'}</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => currentUrl && navigator.clipboard.writeText(currentUrl)}
              disabled={!currentUrl}
            >
              Copy URL
            </Button>
          </div>
        </div>

        <div className="border border-border rounded-xl bg-card p-4">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Subscription
          </h2>
          <PaymentButton showTrial trialText="7-day" showLogin className="w-full" />
        </div>
      </main>
    </div>
  )
}

export default SidePanel
