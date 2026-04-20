import { useEffect, useState } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { Sun, Moon, Globe, Clock, Bookmark, Settings } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * SidePanel Component - Chrome's side panel feature
 * 
 * Features:
 * - Persistent UI that stays open alongside web pages
 * - Page information and actions
 * - Quick tools and utilities
 * - Full React functionality
 */
function SidePanel() {
  const { theme, toggleTheme } = useAppStore()
  const [currentUrl, setCurrentUrl] = useState<string>('')
  const [currentTitle, setCurrentTitle] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'info' | 'tools' | 'bookmarks'>('info')

  // Set theme on document
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  // Get current tab info
  useEffect(() => {
    const getCurrentTab = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tab) {
          setCurrentUrl(tab.url || '')
          setCurrentTitle(tab.title || '')
        }
      } catch (error) {
        console.error('Error getting current tab:', error)
      }
    }

    getCurrentTab()

    // Listen for tab updates
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

  const openOptions = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/icons/icon.svg" alt="Extension Icon" className="w-6 h-6 rounded-md" />
          <span className="font-semibold">React Extension</span>
        </div>
        <div className="flex items-center gap-1">
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
          <motion.button
            onClick={openOptions}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            whileTap={{ scale: 0.95 }}
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </motion.button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-border bg-card px-2 py-2">
        <div className="flex gap-1">
          {[
            { id: 'info', label: 'Page Info', icon: Globe },
            { id: 'tools', label: 'Tools', icon: Clock },
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'info' && (
            <motion.div
              key="info"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-4"
            >
              {/* Current Page Info */}
              <div className="border border-border rounded-xl bg-card p-4 space-y-3">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Current Page
                </h2>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Title</p>
                    <p className="text-sm font-medium line-clamp-2">
                      {currentTitle || 'No page active'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">URL</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                      {currentUrl || 'No URL'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      if (currentUrl) {
                        navigator.clipboard.writeText(currentUrl)
                      }
                    }}
                    disabled={!currentUrl}
                  >
                    Copy URL
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    disabled={!currentUrl}
                  >
                    Bookmark
                  </Button>
                </div>
              </div>

              {/* Page Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-border rounded-xl bg-card p-4">
                  <p className="text-xs text-muted-foreground">Domain</p>
                  <p className="text-sm font-medium mt-1">
                    {currentUrl ? new URL(currentUrl).hostname : '-'}
                  </p>
                </div>
                <div className="border border-border rounded-xl bg-card p-4">
                  <p className="text-xs text-muted-foreground">Protocol</p>
                  <p className="text-sm font-medium mt-1">
                    {currentUrl ? new URL(currentUrl).protocol.slice(0, -1) : '-'}
                  </p>
                </div>
              </div>

              {/* Extension Info */}
              <div className="border border-border rounded-xl bg-card p-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Extension Info
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Version</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Manifest</span>
                    <span>V3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Framework</span>
                    <span>React 19</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tools' && (
            <motion.div
              key="tools"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-3"
            >
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Quick Tools
              </h2>

              {[
                { name: 'Color Picker', desc: 'Pick colors from any page' },
                { name: 'Page Ruler', desc: 'Measure elements on the page' },
                { name: 'Screenshot', desc: 'Capture full page or selection' },
                { name: 'CSS Inspector', desc: 'View and copy CSS styles' },
                { name: 'Responsive Tester', desc: 'Test different screen sizes' },
              ].map((tool, index) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-border rounded-lg bg-card p-3 hover:bg-muted/50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{tool.name}</p>
                      <p className="text-xs text-muted-foreground">{tool.desc}</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                      <Clock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'bookmarks' && (
            <motion.div
              key="bookmarks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-3"
            >
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Recent Bookmarks
              </h2>

              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No bookmarks yet</p>
                <p className="text-xs mt-1">Bookmark pages to see them here</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>React Extension Template</span>
          <span>v1.0.0</span>
        </div>
      </footer>
    </div>
  )
}

export default SidePanel
