import { setupMessageListener } from './handlers/messages'
import { setupKeyboardShortcuts } from './lib/keyboard'

export function initContentScript(contentScriptId: string) {
  console.log(`[Content Script ${contentScriptId}] Ready on:`, window.location.href)

  setupMessageListener(contentScriptId)
  setupKeyboardShortcuts()

  // Notify background that content script is ready
  chrome.runtime.sendMessage({
    type: 'CONTENT_SCRIPT_READY',
    url: window.location.href,
    scriptId: contentScriptId,
  }).catch(() => {
    // Background might not be listening yet
  })
}
