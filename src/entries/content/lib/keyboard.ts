export function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+S to open side panel
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault()
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL' })
    }
  })
}
