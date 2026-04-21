import { highlightElement, scrollToElement, insertTextAtCursor } from '../lib/dom'
import { injectComponent, removeComponent } from '../lib/ui'

export function setupMessageListener(contentScriptId: string) {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
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
          return { pong: true, scriptId: contentScriptId }

        default:
          throw new Error(`Unknown message type: ${message.type}`)
      }
    }

    handleMessage()
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }))

    return true
  })
}
