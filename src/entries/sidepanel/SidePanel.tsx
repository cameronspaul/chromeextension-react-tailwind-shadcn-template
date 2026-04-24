import { useEffect, useState } from 'react'
import { useAppStore, initPaymentListeners } from '../../store'
import { PaymentStatus, PaymentButton } from '../../components/Payment'
import { BookmarkList } from '../../features/bookmarks/BookmarkList'
import { Sun, Moon, Globe, Bookmark, Settings } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { motion } from 'framer-motion'

function SidePanel() {
  const { theme, toggleTheme } = useAppStore()
  const [currentUrl, setCurrentUrl] = useState('')
  const [currentTitle, setCurrentTitle] = useState('')
  const [activeTab, setActiveTab] = useState<'info' | 'bookmarks'>('info')

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

    const listener = (_tabId: number, changeInfo: { url?: string; status?: string }, tab: chrome.tabs.Tab) => {
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

      {/* Tab Navigation */}
      <nav className="border-b border-border bg-card px-2 py-2">
        <div className="flex gap-1">
          {[
            { id: 'info', label: 'Page', icon: Globe },
            { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {activeTab === 'info' && (
          <div className="p-4 space-y-4">
            <div className="border border-border rounded-xl bg-card p-4 space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
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
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => currentUrl && navigator.clipboard.writeText(currentUrl)}
                disabled={!currentUrl}
              >
                Copy URL
              </Button>
            </div>

            <div className="border border-border rounded-xl bg-card p-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Subscription
              </h2>
              <PaymentButton showTrial trialText="7-day" showLogin className="w-full" />
            </div>
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="p-4">
            <BookmarkList />
          </div>
        )}
      </main>
    </div>
  )
}

export default SidePanel
