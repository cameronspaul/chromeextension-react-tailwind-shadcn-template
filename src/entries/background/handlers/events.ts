export function setupEventListeners() {
  // Tab events
  chrome.tabs.onCreated.addListener((tab) => {
    console.log('Tab created:', tab.id)
  })

  chrome.tabs.onRemoved.addListener((tabId) => {
    console.log('Tab removed:', tabId)
  })

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      console.log('Tab updated:', tabId, tab.url)
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
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false })

  // Storage changes
  chrome.storage.onChanged.addListener((changes, areaName) => {
    console.log(`Storage changed in ${areaName}:`, changes)

    chrome.runtime.sendMessage({
      type: 'STORAGE_CHANGED',
      changes,
      areaName,
    }).catch(() => {
      // Ignore errors - no listeners is fine
    })
  })
}
