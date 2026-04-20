import { chromeStorage } from '../../lib/storage'

/**
 * Background Service Worker - Chrome Extension Manifest V3
 * 
 * This runs in the background and handles:
 * - Extension lifecycle events (install, update, startup)
 * - Message passing between popup, content script, and side panel
 * - Chrome API interactions (tabs, bookmarks, etc.)
 * - State management and persistence
 */

// Extension installation/update handler
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('Extension installed/updated:', details.reason)
  
  // Set default settings on first install
  if (details.reason === 'install') {
    await chromeStorage.set('settings', {
      theme: 'light',
      notifications: true,
      autoSync: false,
    })
    
    // Show welcome notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'React Extension Installed',
      message: 'Welcome! Click the extension icon to get started.',
    })
    
    // Open options page on first install
    chrome.runtime.openOptionsPage()
  }
  
  // Handle updates
  if (details.reason === 'update') {
    console.log(`Updated from version ${details.previousVersion}`)
  }
})

// Handle extension startup
chrome.runtime.onStartup.addListener(async () => {
  console.log('Extension started')
  // Perform any startup tasks here
})

// Message passing handler - allows communication between all extension contexts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message, 'from:', sender)
  
  // Handle different message types
  const handleMessage = async () => {
    switch (message.type) {
      case 'GET_TAB_INFO':
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        return { url: tab?.url, title: tab?.title, id: tab?.id }
        
      case 'GET_STORAGE':
        const data = await chromeStorage.get(message.key)
        return { data }
        
      case 'SET_STORAGE':
        await chromeStorage.set(message.key, message.value)
        return { success: true }
        
      case 'CLEAR_STORAGE':
        await chromeStorage.clear()
        return { success: true }
        
      case 'OPEN_SIDE_PANEL':
        // Open side panel on the current window
        if (sender.tab?.windowId) {
          await chrome.sidePanel.open({ windowId: sender.tab.windowId })
        } else {
          const currentWindow = await chrome.windows.getCurrent()
          if (currentWindow.id) {
            await chrome.sidePanel.open({ windowId: currentWindow.id })
          }
        }
        return { success: true }
        
      case 'EXECUTE_SCRIPT':
        // Execute a script in the current tab
        if (sender.tab?.id) {
          const results = await chrome.scripting.executeScript({
            target: { tabId: sender.tab.id },
            func: new Function(message.script) as () => void,
          })
          return { results }
        }
        throw new Error('No active tab')
        
      case 'CREATE_NOTIFICATION':
        const notificationId = await chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: message.title,
          message: message.message,
        })
        return { notificationId }
        
      default:
        throw new Error(`Unknown message type: ${message.type}`)
    }
  }
  
  // Execute and return response
  handleMessage()
    .then(sendResponse)
    .catch((error) => sendResponse({ error: error.message }))
  
  // Return true to indicate we will send a response asynchronously
  return true
})

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command)
  
  switch (command) {
    case 'open_side_panel':
      // Get current window and open side panel
      const currentWindow = await chrome.windows.getCurrent()
      if (currentWindow.id) {
        await chrome.sidePanel.open({ windowId: currentWindow.id })
      }
      break
      
    case '_execute_action':
      // Default action command - popup will open automatically
      break
  }
})

// Tab events listeners
chrome.tabs.onCreated.addListener((tab) => {
  console.log('Tab created:', tab.id)
})

chrome.tabs.onRemoved.addListener((tabId) => {
  console.log('Tab removed:', tabId)
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('Tab updated:', tabId, tab.url)
    
    // You can send messages to content scripts here
    // chrome.tabs.sendMessage(tabId, { type: 'PAGE_LOADED', url: tab.url })
  }
})

// Window events
chrome.windows.onCreated.addListener((window) => {
  console.log('Window created:', window.id)
})

chrome.windows.onRemoved.addListener((windowId) => {
  console.log('Window removed:', windowId)
})

// Side panel behavior
// Configure side panel to open on all sites
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })

// Listen for storage changes to sync across contexts
chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log(`Storage changed in ${areaName}:`, changes)
  
  // Broadcast changes to all extension contexts
  chrome.runtime.sendMessage({
    type: 'STORAGE_CHANGED',
    changes,
    areaName,
  }).catch(() => {
    // Ignore errors - no listeners is fine
  })
})

console.log('Background service worker initialized')
