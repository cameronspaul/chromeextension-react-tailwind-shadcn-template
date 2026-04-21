import ExtPay from 'extpay'

const EXTENSION_PAY_ID = import.meta.env.VITE_EXTPAY_EXTENSION_ID || 'your-extension-id'
const extpay = ExtPay(EXTENSION_PAY_ID)

// Initialize ExtensionPay
extpay.startBackground()

// Extension install/update
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed/updated:', details.reason)

  if (details.reason === 'install') {
    chrome.storage.local.set({
      settings: { theme: 'light', notifications: true }
    })
    chrome.runtime.openOptionsPage()
  }
})

// Handle messages from popup/content/scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handleMessage = async () => {
    switch (message.type) {
      case 'GET_TAB_INFO': {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
        return { url: tab?.url, title: tab?.title, id: tab?.id }
      }

      case 'GET_STORAGE': {
        const data = await chrome.storage.local.get(message.key)
        return { data: data[message.key] }
      }

      case 'SET_STORAGE': {
        await chrome.storage.local.set({ [message.key]: message.value })
        return { success: true }
      }

      case 'OPEN_SIDE_PANEL': {
        const windowId = sender.tab?.windowId || (await chrome.windows.getCurrent()).id
        if (windowId) await chrome.sidePanel.open({ windowId })
        return { success: true }
      }

      case 'GET_PAYMENT_STATUS': {
        const user = await extpay.getUser()
        return { user }
      }

      case 'OPEN_PAYMENT_PAGE': {
        await extpay.openPaymentPage(message.planNickname)
        return { success: true }
      }

      case 'PING':
        return { pong: true }

      default:
        throw new Error(`Unknown message type: ${message.type}`)
    }
  }

  handleMessage()
    .then(sendResponse)
    .catch((error) => sendResponse({ error: error.message }))

  return true
})

// Keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'open_side_panel') {
    const currentWindow = await chrome.windows.getCurrent()
    if (currentWindow.id) {
      await chrome.sidePanel.open({ windowId: currentWindow.id })
    }
  }
})

// Side panel behavior
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })

console.log('Background service worker initialized')
