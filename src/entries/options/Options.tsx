import { useEffect } from 'react'
import { useAppStore } from '../../stores/useAppStore'
import { Sun, Moon } from 'lucide-react'

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
            <img src="/icons/icon.svg" alt="Extension Icon" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-semibold">Extension Settings</h1>
              <p className="text-sm text-muted-foreground">
                Customize your extension experience
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span className="text-sm font-medium capitalize">{theme} Mode</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Appearance Section */}
          <section className="space-y-4">
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
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Options
