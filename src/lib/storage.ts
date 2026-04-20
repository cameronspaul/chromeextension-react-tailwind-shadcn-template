/**
 * Chrome Storage Adapter
 * 
 * Provides a consistent API for Chrome storage with:
 * - Type-safe storage operations
 * - Error handling
 * - Default values
 * - Change detection
 */

export type StorageArea = 'local' | 'sync' | 'managed'

interface StorageData {
  settings?: {
    theme: 'light' | 'dark'
    notifications: boolean
    autoSync: boolean
    [key: string]: unknown
  }
  bookmarks?: Array<{
    url: string
    title: string
    date: number
  }>
  history?: Array<{
    url: string
    title: string
    date: number
  }>
  [key: string]: unknown
}

class ChromeStorage {
  private area: StorageArea

  constructor(area: StorageArea = 'local') {
    this.area = area
  }

  /**
   * Get a value from storage
   */
  async get<K extends keyof StorageData>(
    key: K
  ): Promise<StorageData[K] | undefined> {
    try {
      const result = await chrome.storage[this.area].get(key)
      return result[key]
    } catch (error) {
      console.error(`Error getting ${key} from storage:`, error)
      return undefined
    }
  }

  /**
   * Get multiple values from storage
   */
  async getMultiple<K extends keyof StorageData>(
    keys: K[]
  ): Promise<Pick<StorageData, K>> {
    try {
      return await chrome.storage[this.area].get(keys)
    } catch (error) {
      console.error('Error getting multiple keys from storage:', error)
      return {} as Pick<StorageData, K>
    }
  }

  /**
   * Set a value in storage
   */
  async set<K extends keyof StorageData>(
    key: K,
    value: StorageData[K]
  ): Promise<void> {
    try {
      await chrome.storage[this.area].set({ [key]: value })
    } catch (error) {
      console.error(`Error setting ${key} in storage:`, error)
      throw error
    }
  }

  /**
   * Set multiple values in storage
   */
  async setMultiple(data: Partial<StorageData>): Promise<void> {
    try {
      await chrome.storage[this.area].set(data)
    } catch (error) {
      console.error('Error setting multiple keys in storage:', error)
      throw error
    }
  }

  /**
   * Remove a value from storage
   */
  async remove<K extends keyof StorageData>(key: K): Promise<void> {
    try {
      await chrome.storage[this.area].remove(key)
    } catch (error) {
      console.error(`Error removing ${key} from storage:`, error)
      throw error
    }
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await chrome.storage[this.area].clear()
    } catch (error) {
      console.error('Error clearing storage:', error)
      throw error
    }
  }

  /**
   * Get all storage data
   */
  async getAll(): Promise<StorageData> {
    try {
      return await chrome.storage[this.area].get(null)
    } catch (error) {
      console.error('Error getting all storage:', error)
      return {}
    }
  }

  /**
   * Listen for storage changes
   */
  onChanged(
    callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void
  ): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === this.area) {
        callback(changes)
      }
    }

    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }
}

// Export singleton instances for different storage areas
export const chromeStorage = new ChromeStorage('local')
export const chromeSyncStorage = new ChromeStorage('sync')

export default ChromeStorage
