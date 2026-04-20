import '../../theme.css'
import { createShadowRootUI } from './shadow-dom'

/**
 * Content Script - Injected into all web pages
 * 
 * Features:
 * - Shadow DOM isolation (prevents CSS conflicts with host page)
 * - React component injection
 * - Message passing with background/service worker
 * - Page interaction and manipulation
 */

// Content script ID for debugging
const CONTENT_SCRIPT_ID = Math.random().toString(36).slice(2, 9)
console.log(`[Content Script ${CONTENT_SCRIPT_ID}] Initialized`)

// Flag to track if content script is ready
let isReady = false

/**
 * Initialize the content script
 */
function initContentScript() {
  if (isReady) return
  isReady = true

  console.log(`[Content Script ${CONTENT_SCRIPT_ID}] Ready on:`, window.location.href)

  // Listen for messages from background/popup/sidepanel
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    console.log(`[Content Script] Message received:`, message)
    
    const handleMessage = async () => {
      switch (message.type) {
        case 'GET_PAGE_INFO':
          return {
            url: window.location.href,
            title: document.title,
            domain: window.location.hostname,
          }
          
        case 'HIGHLIGHT_ELEMENT':
          highlightElement(message.selector)
          return { success: true }
          
        case 'SCROLL_TO_ELEMENT':
          scrollToElement(message.selector)
          return { success: true }
          
        case 'INJECT_COMPONENT':
          // Inject a React component into the page
          await injectComponent(message.componentType, message.props)
          return { success: true }
          
        case 'REMOVE_COMPONENT':
          removeComponent()
          return { success: true }
          
        case 'GET_SELECTED_TEXT':
          return { text: window.getSelection()?.toString() || '' }
          
        case 'INSERT_TEXT':
          insertTextAtCursor(message.text)
          return { success: true }
          
        case 'PING':
          return { pong: true, scriptId: CONTENT_SCRIPT_ID }
          
        default:
          throw new Error(`Unknown message type: ${message.type}`)
      }
    }
    
    handleMessage()
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }))
    
    return true // Async response
  })

  // Create shadow DOM UI (optional - uncomment to enable floating UI)
  // Uncomment to add a floating button to all pages
  // createFloatingUI()
  
  // Add keyboard shortcuts
  setupKeyboardShortcuts()
  
  // Notify background that content script is ready
  chrome.runtime.sendMessage({
    type: 'CONTENT_SCRIPT_READY',
    url: window.location.href,
    scriptId: CONTENT_SCRIPT_ID,
  }).catch(() => {
    // Background might not be listening yet
  })
}

/**
 * Highlight an element on the page
 */
function highlightElement(selector: string) {
  const element = document.querySelector(selector)
  if (!element) {
    console.warn(`[Content Script] Element not found: ${selector}`)
    return
  }
  
  // Add highlight styles
  const originalOutline = (element as HTMLElement).style.outline
  const originalBoxShadow = (element as HTMLElement).style.boxShadow
  
  ;(element as HTMLElement).style.outline = '3px solid #3b82f6'
  ;(element as HTMLElement).style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.3)'
  ;(element as HTMLElement).style.transition = 'outline 0.2s, box-shadow 0.2s'
  ;(element as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
  
  // Remove highlight after 3 seconds
  setTimeout(() => {
    ;(element as HTMLElement).style.outline = originalOutline
    ;(element as HTMLElement).style.boxShadow = originalBoxShadow
  }, 3000)
}

/**
 * Scroll to an element on the page
 */
function scrollToElement(selector: string) {
  const element = document.querySelector(selector)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/**
 * Inject a React component into the page using Shadow DOM
 */
async function injectComponent(componentType: string, props: Record<string, unknown>) {
  // This would integrate with your React components
  // For now, we'll create a placeholder
  const container = document.createElement('div')
  container.id = 'react-extension-injected-component'
  container.style.cssText = `
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 2147483647;
  `
  
  document.body.appendChild(container)
  
  // Initialize Shadow DOM with React
  createShadowRootUI(container, componentType, props)
  
  console.log(`[Content Script] Injected component: ${componentType}`)
}

/**
 * Remove the injected component
 */
function removeComponent() {
  const container = document.getElementById('react-extension-injected-component')
  if (container) {
    container.remove()
    console.log('[Content Script] Removed injected component')
  }
}

/**
 * Insert text at cursor position
 */
function insertTextAtCursor(text: string) {
  const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement
  
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    const start = activeElement.selectionStart || 0
    const end = activeElement.selectionEnd || 0
    const value = activeElement.value
    
    activeElement.value = value.substring(0, start) + text + value.substring(end)
    activeElement.selectionStart = activeElement.selectionEnd = start + text.length
    
    // Trigger input event
    activeElement.dispatchEvent(new Event('input', { bubbles: true }))
  }
}

/**
 * Create floating UI using Shadow DOM
 * Export to avoid "unused function" error - called when floating UI is enabled
 */
export function createFloatingUI() {
  // Create a floating button that opens the side panel
  const button = document.createElement('button')
  button.id = 'react-extension-floating-button'
  button.innerHTML = 'RE'
  button.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    border: none;
    cursor: pointer;
    font-weight: bold;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 2147483647;
    transition: transform 0.2s, box-shadow 0.2s;
  `
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)'
    button.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)'
  })
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)'
    button.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)'
  })
  
  button.addEventListener('click', async () => {
    try {
      await chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' })
    } catch (error) {
      console.error('Failed to open side panel:', error)
    }
  })
  
  // Use Shadow DOM for style isolation
  const host = document.createElement('div')
  host.id = 'react-extension-host'
  const shadow = host.attachShadow({ mode: 'open' })
  shadow.appendChild(button)
  
  document.body.appendChild(host)
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Example: Ctrl+Shift+S to open side panel
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault()
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' })
    }
  })
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContentScript)
} else {
  initContentScript()
}

// Also re-initialize on navigation (for SPAs)
let lastUrl = location.href
new MutationObserver(() => {
  const url = location.href
  if (url !== lastUrl) {
    lastUrl = url
    console.log(`[Content Script] URL changed: ${url}`)
    // Re-initialize if needed
  }
}).observe(document, { subtree: true, childList: true })
