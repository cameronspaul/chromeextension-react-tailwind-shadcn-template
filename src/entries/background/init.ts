import { chromeStorage } from '@/lib/storage'
import { initExtPayBackground } from '@/lib/extpay'

export function initBackground() {
  // Initialize ExtensionPay background handling
  // IMPORTANT: This must be called once when the service worker starts.
  // Do NOT call startBackground() inside callbacks or listeners.
  initExtPayBackground()

  // Extension installation/update handler
  chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('Extension installed/updated:', details.reason)

    if (details.reason === 'install') {
      await chromeStorage.set('settings', {
        theme: 'light',
        notifications: true,
        autoSync: false,
      })

      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'React Extension Installed',
        message: 'Welcome! Click the extension icon to get started.',
      })

      chrome.runtime.openOptionsPage()
    }

    if (details.reason === 'update') {
      console.log(`Updated from version ${details.previousVersion}`)
    }
  })

  // Handle extension startup
  chrome.runtime.onStartup.addListener(async () => {
    console.log('Extension started')
  })
}
