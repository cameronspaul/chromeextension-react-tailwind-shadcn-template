/**
 * Chrome Extension Messaging System
 * 
 * Provides typed message passing between:
 * - Popup ↔ Background
 * - Content Script ↔ Background
 * - Side Panel ↔ Background
 * - Options ↔ Background
 * 
 * All contexts can communicate with each other through the background service worker.
 */

// Message types for type-safe communication
export interface MessageMap {
  // Tab operations
  'GET_TAB_INFO': {
    response: { url?: string; title?: string; id?: number }
  }
  
  // Storage operations
  'GET_STORAGE': {
    payload: { key: string }
    response: { data: unknown }
  }
  'SET_STORAGE': {
    payload: { key: string; value: unknown }
    response: { success: boolean }
  }
  'CLEAR_STORAGE': {
    response: { success: boolean }
  }
  
  // Side panel
  'OPEN_SIDE_PANEL': {
    response: { success: boolean }
  }
  
  // Script execution
  'EXECUTE_SCRIPT': {
    payload: { script: string; tabId?: number }
    response: { results?: unknown[]; error?: string }
  }
  
  // Notifications
  'CREATE_NOTIFICATION': {
    payload: { title: string; message: string }
    response: { notificationId?: string }
  }
  
  // Content script communication
  'GET_PAGE_INFO': {
    response: { url: string; title: string; domain: string }
  }
  'HIGHLIGHT_ELEMENT': {
    payload: { selector: string }
    response: { success: boolean }
  }
  'SCROLL_TO_ELEMENT': {
    payload: { selector: string }
    response: { success: boolean }
  }
  'INJECT_COMPONENT': {
    payload: { componentType: string; props?: Record<string, unknown> }
    response: { success: boolean }
  }
  'REMOVE_COMPONENT': {
    response: { success: boolean }
  }
  'GET_SELECTED_TEXT': {
    response: { text: string }
  }
  'INSERT_TEXT': {
    payload: { text: string }
    response: { success: boolean }
  }
  
  // Lifecycle
  'PING': {
    response: { pong: true; scriptId?: string }
  }
  'CONTENT_SCRIPT_READY': {
    payload: { url: string; scriptId: string }
    response: void
  }
  
  // Storage sync
  'STORAGE_CHANGED': {
    payload: {
      changes: { [key: string]: chrome.storage.StorageChange }
      areaName: string
    }
    response: void
  }

  // Payment operations (ExtensionPay)
  'GET_PAYMENT_STATUS': {
    response: { user: unknown }
  }
  'GET_PAYMENT_PLANS': {
    response: { plans: unknown[] }
  }
  'OPEN_PAYMENT_PAGE': {
    payload: { planNickname?: string }
    response: { success: boolean }
  }
  'OPEN_TRIAL_PAGE': {
    payload: { displayText?: string }
    response: { success: boolean }
  }
  'OPEN_LOGIN_PAGE': {
    response: { success: boolean }
  }
}

export type MessageType = keyof MessageMap

/**
 * Send a message to the background service worker
 */
export async function sendMessage<T extends MessageType>(
  type: T,
  payload?: MessageMap[T] extends { payload: infer P } ? P : never
): Promise<MessageMap[T] extends { response: infer R } ? R : void> {
  const message = {
    type,
    ...(payload || {}),
  }
  
  const response = await chrome.runtime.sendMessage(message)
  
  if (response?.error) {
    throw new Error(response.error)
  }
  
  return response as never
}

/**
 * Send a message to a specific tab's content script
 */
export async function sendMessageToTab<T extends MessageType>(
  tabId: number,
  type: T,
  payload?: MessageMap[T] extends { payload: infer P } ? P : never
): Promise<MessageMap[T] extends { response: infer R } ? R : void> {
  const message = {
    type,
    ...(payload || {}),
  }
  
  const response = await chrome.tabs.sendMessage(tabId, message)
  
  if (response?.error) {
    throw new Error(response.error)
  }
  
  return response as never
}

/**
 * Send a message to the current tab's content script
 */
export async function sendMessageToCurrentTab<T extends MessageType>(
  type: T,
  payload?: MessageMap[T] extends { payload: infer P } ? P : never
): Promise<MessageMap[T] extends { response: infer R } ? R : void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab.id) {
    throw new Error('No active tab found')
  }
  return sendMessageToTab(tab.id, type, payload)
}

/**
 * Listen for messages
 */
export function onMessage<T extends MessageType>(
  type: T,
  handler: (
    message: MessageMap[T] extends { payload: infer P } 
      ? { type: T } & P 
      : { type: T },
    sender: chrome.runtime.MessageSender
  ) => Promise<MessageMap[T] extends { response: infer R } ? R : void> | void
): () => void {
  const listener = (
    message: { type: MessageType },
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: unknown) => void
  ) => {
    if (message.type === type) {
      const result = handler(message as never, sender)
      
      if (result instanceof Promise) {
        result
          .then(sendResponse)
          .catch((error) => sendResponse({ error: error.message }))
        return true // Async response
      } else {
        sendResponse(result)
      }
    }
  }
  
  chrome.runtime.onMessage.addListener(listener)
  return () => chrome.runtime.onMessage.removeListener(listener)
}

/**
 * Broadcast a message to all extension contexts
 */
export async function broadcastMessage<T extends MessageType>(
  type: T,
  ...args: MessageMap[T] extends { payload: infer P } ? [P] : []
): Promise<void> {
  const message = {
    type,
    ...(args[0] || {}),
  }
  
  try {
    await chrome.runtime.sendMessage(message)
  } catch {
    // Background might not be listening, that's ok
  }
  
  // Send to all tabs
  const tabs = await chrome.tabs.query({})
  for (const tab of tabs) {
    if (tab.id) {
      try {
        await chrome.tabs.sendMessage(tab.id, message)
      } catch {
        // Tab might not have content script, that's ok
      }
    }
  }
}

/**
 * Create a typed message client for a specific context
 */
export function createMessageClient() {
  return {
    // Tab operations
    async getTabInfo() {
      return sendMessage('GET_TAB_INFO')
    },
    
    // Storage operations
    async getStorage<T>(key: string): Promise<T | undefined> {
      const { data } = await sendMessage('GET_STORAGE', { key })
      return data as T
    },
    
    async setStorage(key: string, value: unknown) {
      return sendMessage('SET_STORAGE', { key, value })
    },
    
    async clearStorage() {
      return sendMessage('CLEAR_STORAGE')
    },
    
    // Side panel
    async openSidePanel() {
      return sendMessage('OPEN_SIDE_PANEL')
    },
    
    // Notifications
    async createNotification(title: string, message: string) {
      return sendMessage('CREATE_NOTIFICATION', { title, message })
    },
    
    // Content script operations
    async getPageInfo() {
      return sendMessageToCurrentTab('GET_PAGE_INFO')
    },
    
    async highlightElement(selector: string) {
      return sendMessageToCurrentTab('HIGHLIGHT_ELEMENT', { selector })
    },
    
    async scrollToElement(selector: string) {
      return sendMessageToCurrentTab('SCROLL_TO_ELEMENT', { selector })
    },
    
    async injectComponent(componentType: string, props?: Record<string, unknown>) {
      return sendMessageToCurrentTab('INJECT_COMPONENT', { componentType, props })
    },
    
    async removeComponent() {
      return sendMessageToCurrentTab('REMOVE_COMPONENT')
    },
    
    async getSelectedText() {
      return sendMessageToCurrentTab('GET_SELECTED_TEXT')
    },
    
    async insertText(text: string) {
      return sendMessageToCurrentTab('INSERT_TEXT', { text })
    },

    // Payment operations
    async getPaymentStatus() {
      return sendMessage('GET_PAYMENT_STATUS')
    },

    async getPaymentPlans() {
      return sendMessage('GET_PAYMENT_PLANS')
    },

    async openPaymentPage(planNickname?: string) {
      return sendMessage('OPEN_PAYMENT_PAGE', { planNickname })
    },

    async openTrialPage(displayText?: string) {
      return sendMessage('OPEN_TRIAL_PAGE', { displayText })
    },

    async openLoginPage() {
      return sendMessage('OPEN_LOGIN_PAGE')
    },
  }
}

// Export singleton client
export const messageClient = createMessageClient()

export default messageClient
