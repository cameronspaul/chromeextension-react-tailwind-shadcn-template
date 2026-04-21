import { useEffect } from 'react'
import { useAppStore } from '../../store'
import { Sun, Moon } from 'lucide-react'

function Options() {
  const { theme, toggleTheme } = useAppStore()

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    root.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="min-h-screen bg-background text-foreground">
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

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="border border-border rounded-xl bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Theme</p>
              <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
            </div>
            <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
              <button
                onClick={() => theme !== 'light' && toggleTheme()}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  theme === 'light' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Light
              </button>
              <button
                onClick={() => theme !== 'dark' && toggleTheme()}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  theme === 'dark' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Dark
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Options
