import { chromeStorage } from '@/lib/storage'
import { getExtPay } from '@/lib/extpay'

export async function handleGetTabInfo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return { url: tab?.url, title: tab?.title, id: tab?.id }
}

export async function handleGetStorage(key: string) {
  const data = await chromeStorage.get(key as never)
  return { data }
}

export async function handleSetStorage(key: string, value: unknown) {
  await chromeStorage.set(key as never, value)
  return { success: true }
}

export async function handleClearStorage() {
  await chromeStorage.clear()
  return { success: true }
}

export async function handleOpenSidePanel(sender: chrome.runtime.MessageSender) {
  if (sender.tab?.windowId) {
    await chrome.sidePanel.open({ windowId: sender.tab.windowId })
  } else {
    const currentWindow = await chrome.windows.getCurrent()
    if (currentWindow.id) {
      await chrome.sidePanel.open({ windowId: currentWindow.id })
    }
  }
  return { success: true }
}

export async function handleExecuteScript(sender: chrome.runtime.MessageSender, script: string) {
  if (!sender.tab?.id) throw new Error('No active tab')
  const results = await chrome.scripting.executeScript({
    target: { tabId: sender.tab.id },
    func: new Function(script) as () => void,
  })
  return { results }
}

export async function handleCreateNotification(title: string, message: string) {
  const notificationId = await chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title,
    message,
  })
  return { notificationId }
}

export async function handleGetPaymentStatus() {
  const extpay = getExtPay()
  const user = await extpay.getUser()
  return { user }
}

export async function handleGetPaymentPlans() {
  const extpay = getExtPay()
  const plans = await extpay.getPlans()
  return { plans }
}

export async function handleOpenPaymentPage(planNickname?: string) {
  const extpay = getExtPay()
  await extpay.openPaymentPage(planNickname)
  return { success: true }
}

export async function handleOpenTrialPage(displayText?: string) {
  const extpay = getExtPay()
  await extpay.openTrialPage(displayText)
  return { success: true }
}

export async function handleOpenLoginPage() {
  const extpay = getExtPay()
  await extpay.openLoginPage()
  return { success: true }
}

export async function dispatchMessage(message: any, sender: chrome.runtime.MessageSender) {
  switch (message.type) {
    case 'GET_TAB_INFO':
      return handleGetTabInfo()
    case 'GET_STORAGE':
      return handleGetStorage(message.key)
    case 'SET_STORAGE':
      return handleSetStorage(message.key, message.value)
    case 'CLEAR_STORAGE':
      return handleClearStorage()
    case 'OPEN_SIDE_PANEL':
      return handleOpenSidePanel(sender)
    case 'EXECUTE_SCRIPT':
      return handleExecuteScript(sender, message.script)
    case 'CREATE_NOTIFICATION':
      return handleCreateNotification(message.title, message.message)
    case 'GET_PAYMENT_STATUS':
      return handleGetPaymentStatus()
    case 'GET_PAYMENT_PLANS':
      return handleGetPaymentPlans()
    case 'OPEN_PAYMENT_PAGE':
      return handleOpenPaymentPage(message.planNickname)
    case 'OPEN_TRIAL_PAGE':
      return handleOpenTrialPage(message.displayText)
    case 'OPEN_LOGIN_PAGE':
      return handleOpenLoginPage()
    default:
      throw new Error(`Unknown message type: ${message.type}`)
  }
}

export function setupMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    dispatchMessage(message, sender)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }))

    return true
  })
}
