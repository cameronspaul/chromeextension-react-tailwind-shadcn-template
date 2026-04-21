import '../../theme.css'
import { initContentScript } from './init'

/**
 * Content Script - Injected into all web pages
 *
 * This is the entry point. Each module handles a specific concern:
 * - init.ts              → Content script lifecycle and wiring
 * - handlers/messages.ts → Message passing with background/popup/sidepanel
 * - lib/dom.ts          → DOM manipulation utilities
 * - lib/ui.ts           → UI injection (floating button, components)
 * - lib/keyboard.ts     → Page keyboard shortcuts
 */

const CONTENT_SCRIPT_ID = Math.random().toString(36).slice(2, 9)
console.log(`[Content Script ${CONTENT_SCRIPT_ID}] Initialized`)

let isReady = false

function start() {
  if (isReady) return
  isReady = true
  initContentScript(CONTENT_SCRIPT_ID)
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start)
} else {
  start()
}

// Also re-initialize on navigation (for SPAs)
let lastUrl = location.href
new MutationObserver(() => {
  const url = location.href
  if (url !== lastUrl) {
    lastUrl = url
    console.log(`[Content Script] URL changed: ${url}`)
  }
}).observe(document, { subtree: true, childList: true })
