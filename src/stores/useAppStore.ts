import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { chromeStorage } from '../lib/storage'
import { onMessage } from '../lib/messaging'

/**
 * Chrome Extension Storage Adapter for Zustand
 * 
 * This middleware enables Zustand to persist state to Chrome's storage API,
 * making data available across all extension contexts (popup, options, 
 * side panel, content script, and background).
 */

interface AppState {
  // Theme settings
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  
  // Extension settings
  settings: {
    notifications: boolean
    autoSync: boolean
    sidebarOpen: boolean
  }
  updateSettings: (settings: Partial<AppState['settings']>) => void
  
  // Current tab info (synced from content script)
  currentTab: {
    url: string
    title: string
    domain: string
  } | null
  setCurrentTab: (tab: AppState['currentTab']) => void
  
  // UI state
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

/**
 * Chrome Storage Persistence Middleware
 * 
 * Replaces localStorage with Chrome's storage API for cross-context persistence
 */
const chromeStoragePersist = {
  name: 'chrome-app-store',
  storage: {
    getItem: async (name: string) => {
      const value = await chromeStorage.get(name as never)
      return value ? { state: value } : null
    },
    setItem: async (name: string, value: { state: unknown }) => {
      await chromeStorage.set(name as never, value.state)
    },
    removeItem: async (name: string) => {
      await chromeStorage.remove(name as never)
    },
  },
}

/**
 * Create the Zustand store with Chrome extension features
 */
export const useAppStore = create<AppState>()(
  subscribeWithSelector(
    immer(
      persist(
        (set, get) => ({
          // Initial state
          theme: 'light',
          settings: {
            notifications: true,
            autoSync: false,
            sidebarOpen: true,
          },
          currentTab: null,
          isLoading: false,
          
          // Actions
          setTheme: (theme) => {
            set((state) => {
              state.theme = theme
            })
            
            // Apply theme to document
            const root = document.documentElement
            root.setAttribute('data-theme', theme)
            if (theme === 'dark') root.classList.add('dark')
            else root.classList.remove('dark')
          },
          
          toggleTheme: () => {
            const currentTheme = get().theme
            get().setTheme(currentTheme === 'light' ? 'dark' : 'light')
          },
          
          updateSettings: (newSettings) => {
            set((state) => {
              state.settings = { ...state.settings, ...newSettings }
            })
          },
          
          setCurrentTab: (tab) => {
            set((state) => {
              state.currentTab = tab
            })
          },
          
          setIsLoading: (loading) => {
            set((state) => {
              state.isLoading = loading
            })
          },
        }),
        {
          name: 'app-store',
          storage: chromeStoragePersist.storage,
          partialize: (state) => ({
            theme: state.theme,
            settings: state.settings,
          }),
          onRehydrateStorage: () => {
            return (state, error) => {
              if (error) {
                console.error('Error rehydrating store:', error)
              } else if (state) {
                // Apply theme after rehydration
                const root = document.documentElement
                root.setAttribute('data-theme', state.theme)
                if (state.theme === 'dark') root.classList.add('dark')
                else root.classList.remove('dark')
              }
            }
          },
        }
      )
    )
  )
)

/**
 * Sync store across all extension contexts
 * 
 * This enables real-time state sync between popup, options, side panel, etc.
 */
export function initStoreSync(): () => void {
  // Listen for storage changes from other contexts
  const unsubscribe = chromeStorage.onChanged((changes) => {
    for (const [key, change] of Object.entries(changes)) {
      if (key === 'app-store' && change?.newValue) {
        // Update store with new values from other contexts
        const newState = change.newValue as { theme?: 'light' | 'dark'; settings?: AppState['settings'] }
        
        if (newState.theme) {
          useAppStore.setState({ theme: newState.theme })
        }
        
        if (newState.settings) {
          useAppStore.setState((state) => ({
            settings: { ...state.settings, ...newState.settings },
          }))
        }
      }
    }
  })
  
  // Listen for sync messages from background
  const messageUnsub = onMessage('STORAGE_CHANGED', (_message) => {
    console.log('Store sync message received')
  })
  
  return () => {
    unsubscribe()
    messageUnsub()
  }
}

/**
 * Subscribe to store changes (for debugging or side effects)
 */
export function subscribeToStore(
  selector: (state: AppState) => unknown,
  callback: (selectedState: unknown, previousSelectedState: unknown) => void
): () => void {
  return useAppStore.subscribe(selector, callback)
}

export default useAppStore
