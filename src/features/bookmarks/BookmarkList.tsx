import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import type { Bookmark } from './types'

export function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  const loadBookmarks = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_BOOKMARKS' })
      console.log('[Bookmarks] Loaded:', response)
      setBookmarks(response.bookmarks || [])
    } catch (error) {
      console.error('[Bookmarks] Failed to load:', error)
    }
  }

  useEffect(() => {
    loadBookmarks()
  }, [])

  const addBookmark = async () => {
    try {
      console.log('[Bookmarks] Adding bookmark...')
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
      console.log('[Bookmarks] Current tab:', tab)

      if (tab?.url && tab?.title) {
        const response = await chrome.runtime.sendMessage({
          type: 'ADD_BOOKMARK',
          url: tab.url,
          title: tab.title
        })
        console.log('[Bookmarks] Add response:', response)
        await loadBookmarks()
      } else {
        console.warn('[Bookmarks] No tab URL or title found')
      }
    } catch (error) {
      console.error('[Bookmarks] Failed to add:', error)
    }
  }

  const deleteBookmark = async (id: string) => {
    try {
      await chrome.runtime.sendMessage({ type: 'DELETE_BOOKMARK', id })
      await loadBookmarks()
    } catch (error) {
      console.error('[Bookmarks] Failed to delete:', error)
    }
  }

  return (
    <div className="space-y-2">
      <Button onClick={addBookmark} size="sm" className="w-full">
        Bookmark Current Page
      </Button>

      {bookmarks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No bookmarks yet
        </p>
      ) : (
        <div className="space-y-1">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="flex items-center justify-between p-2 rounded bg-muted group"
            >
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm truncate flex-1 hover:underline"
                title={bookmark.title}
              >
                {bookmark.title}
              </a>
              <button
                onClick={() => deleteBookmark(bookmark.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive px-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
