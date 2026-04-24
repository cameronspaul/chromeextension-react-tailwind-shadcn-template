# Chrome Extension React Template

A modern Chrome extension template with **React 19**, **Vite**, **Tailwind CSS v4**, and **shadcn/ui**.

## Features

- ⚛️ React 19 + TypeScript
- ⚡ Vite for fast builds
- 🎨 Tailwind CSS v4 + shadcn/ui
- 📦 Zustand + Chrome Storage
- 📡 Simple message passing
- 🎯 Manifest V3
- 🌗 Light/dark themes
- 💳 ExtensionPay integration
- 🧩 **Feature-based architecture** - add features without bloating core files

## Project Structure

```
src/
├── entries/          # UI entry points (popup, options, sidepanel)
├── features/         # Feature modules - each self-contained
│   └── bookmarks/
│       ├── types.ts
│       ├── handlers.ts    # Background message handlers
│       ├── BookmarkList.tsx
│       └── index.ts
├── components/       # Shared components
├── lib/             # Utilities
├── background.ts    # Service worker (stays small!)
├── content.ts       # Content script
└── store.ts         # Zustand stores
```

## Quick Start

```bash
npm install
npm run build
```

Load `dist/` folder in `chrome://extensions/` (Developer mode → Load unpacked).

## Adding Features

This template uses **feature-based architecture**. Each feature is self-contained in `src/features/<name>/`.

### Example: Adding a History Feature

Create `src/features/history/`:

**types.ts**
```typescript
export interface HistoryItem {
  id: string
  url: string
  title: string
  visitedAt: number
}
```

**handlers.ts**
```typescript
export async function handleHistoryMessage(type: string, payload: unknown) {
  switch (type) {
    case 'ADD_HISTORY': {
      const { url, title } = payload as { url: string; title: string }
      const item = { id: crypto.randomUUID(), url, title, visitedAt: Date.now() }
      const existing = await chrome.storage.local.get('history')
      const history = [item, ...(existing.history || [])].slice(0, 100)
      await chrome.storage.local.set({ history })
      return { success: true, item }
    }
    case 'GET_HISTORY': {
      const data = await chrome.storage.local.get('history')
      return { history: data.history || [] }
    }
    default:
      return null  // Not handled
  }
}
```

**HistoryList.tsx**
```typescript
import { useState, useEffect } from 'react'
import type { HistoryItem } from './types'

export function HistoryList() {
  const [history, setHistory] = useState<HistoryItem[]>([])

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_HISTORY' })
      .then(r => setHistory(r.history || []))
  }, [])

  return (
    <div>
      {history.map(item => (
        <a key={item.id} href={item.url}>{item.title}</a>
      ))}
    </div>
  )
}
```

**index.ts**
```typescript
export { handleHistoryMessage } from './handlers'
export { HistoryList } from './HistoryList'
```

**Wire up in background.ts** - add just 2 lines:
```typescript
import { handleHistoryMessage } from './features/history/handlers'

// In message listener:
const result = await handleHistoryMessage(message.type, message)
if (result !== null) return result
```

**Use in UI:**
```typescript
import { HistoryList } from '@/features/history/HistoryList'
```

### Why This Pattern?

- **background.ts stays small** - just imports handlers
- **Features are isolated** - everything in one folder
- **Easy to add/remove** - create/delete folder + 2 lines in background.ts
- **No merge conflicts** - developers work on separate feature folders

### Guidelines

- Keep files small: `types.ts` < 50 lines, `handlers.ts` < 100 lines, UI < 150 lines
- Split large features: `features/bookmarks/handlers/crud.ts`, `features/bookmarks/handlers/sync.ts`
- Features don't import from each other - use message passing

## Usage

### Message Passing
```typescript
import { getTabInfo, setStorage } from '@/lib/messaging'

const tab = await getTabInfo()
await setStorage('key', value)
```

### Side Panel
```typescript
// openSidePanel() must be called directly from a user gesture context
// It's exported separately from messaging.ts
import { openSidePanel } from '@/lib/messaging'
await openSidePanel()
```

### State
```typescript
import { useAppStore, usePaymentStore } from '@/store'

const { theme, toggleTheme } = useAppStore()
const { isPaid } = usePaymentStore()
```

### Payment Components
```tsx
import { PaymentStatus, PaymentButton, PaymentGate } from '@/components/Payment'

<PaymentStatus />
<PaymentButton showTrial trialText="7-day" />
<PaymentGate>premium content</PaymentGate>
```

## License

MIT License
