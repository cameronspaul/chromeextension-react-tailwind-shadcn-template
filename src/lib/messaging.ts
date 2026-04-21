// Simple typed messaging helper
export async function sendMessage<T = unknown>(type: string, payload?: Record<string, unknown>): Promise<T> {
  const message = payload ? { type, ...payload } : { type }
  const response = await chrome.runtime.sendMessage(message)
  if (response?.error) throw new Error(response.error)
  return response as T
}

export async function getTabInfo() {
  return sendMessage<{ url?: string; title?: string; id?: number }>('GET_TAB_INFO')
}

export async function getStorage<T>(key: string): Promise<T | undefined> {
  const { data } = await sendMessage<{ data: T }>('GET_STORAGE', { key })
  return data
}

export async function setStorage(key: string, value: unknown) {
  return sendMessage('SET_STORAGE', { key, value })
}

export async function openSidePanel() {
  return sendMessage('OPEN_SIDE_PANEL')
}
