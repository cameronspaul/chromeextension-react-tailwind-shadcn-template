import type { Bookmark } from './types'

// Background message handlers for bookmarks
export async function handleBookmarkMessage(type: string, payload: unknown) {
  console.log('[Bookmark Handler] Received:', type, payload)

  switch (type) {
    case 'ADD_BOOKMARK': {
      const { url, title } = payload as { url: string; title: string }
      console.log('[Bookmark Handler] Adding bookmark:', { url, title })

      const bookmark: Bookmark = {
        id: crypto.randomUUID(),
        url,
        title,
        createdAt: Date.now()
      }

      const existing = await chrome.storage.local.get('bookmarks') as { bookmarks?: Bookmark[] }
      const bookmarks = [...(existing.bookmarks || []), bookmark]
      await chrome.storage.local.set({ bookmarks })

      console.log('[Bookmark Handler] Saved, total bookmarks:', bookmarks.length)
      return { success: true, bookmark }
    }

    case 'GET_BOOKMARKS': {
      const data = await chrome.storage.local.get('bookmarks') as { bookmarks?: Bookmark[] }
      console.log('[Bookmark Handler] Getting bookmarks:', data.bookmarks?.length || 0)
      return { bookmarks: data.bookmarks || [] }
    }

    case 'DELETE_BOOKMARK': {
      const { id } = payload as { id: string }
      console.log('[Bookmark Handler] Deleting bookmark:', id)

      const data = await chrome.storage.local.get('bookmarks') as { bookmarks?: Bookmark[] }
      const bookmarks = (data.bookmarks || []).filter((b: Bookmark) => b.id !== id)
      await chrome.storage.local.set({ bookmarks })

      return { success: true }
    }

    default:
      return null // Not handled
  }
}
