/**
 * DOM manipulation utilities for the content script
 */

export function highlightElement(selector: string) {
  const element = document.querySelector(selector)
  if (!element) {
    console.warn(`[Content Script] Element not found: ${selector}`)
    return
  }

  const el = element as HTMLElement
  const originalOutline = el.style.outline
  const originalBoxShadow = el.style.boxShadow

  el.style.outline = '3px solid #3b82f6'
  el.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.3)'
  el.style.transition = 'outline 0.2s, box-shadow 0.2s'
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })

  setTimeout(() => {
    el.style.outline = originalOutline
    el.style.boxShadow = originalBoxShadow
  }, 3000)
}

export function scrollToElement(selector: string) {
  const element = document.querySelector(selector)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export function insertTextAtCursor(text: string) {
  const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement

  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    const start = activeElement.selectionStart || 0
    const end = activeElement.selectionEnd || 0
    const value = activeElement.value

    activeElement.value = value.substring(0, start) + text + value.substring(end)
    activeElement.selectionStart = activeElement.selectionEnd = start + text.length

    activeElement.dispatchEvent(new Event('input', { bubbles: true }))
  }
}
