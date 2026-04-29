const SCRIPT_ID = Math.random().toString(36).slice(2, 9)
console.log(`[Content Script ${SCRIPT_ID}] Initialized`)

// Message handling
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handleMessage = async () => {
    switch (message.type) {
      case 'GET_PAGE_INFO':
        return {
          url: window.location.href,
          title: document.title,
          domain: window.location.hostname,
        }

      case 'GET_SELECTED_TEXT':
        return { text: window.getSelection()?.toString() || '' }

      case 'PING':
        return { pong: true, scriptId: SCRIPT_ID }

      default:
        throw new Error(`Unknown message type: ${message.type}`)
    }
  }

  handleMessage()
    .then(sendResponse)
    .catch((error) => sendResponse({ error: error.message }))

  return true
})

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'S') {
    e.preventDefault()
    chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' })
  }
})

// Notify background that content script is ready
chrome.runtime.sendMessage({
  type: 'CONTENT_SCRIPT_READY',
  url: window.location.href,
  scriptId: SCRIPT_ID,
}).catch(() => {})
