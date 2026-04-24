# Project Rules

Coding standards for this Chrome Extension React Template.

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- shadcn/ui
- Zustand + Chrome Storage

## Core Rules

### 1. Styling
- Use Tailwind utility classes only
- Modify only CSS variables in `theme.css`
- No separate `.css` files

### 2. Components
- Use shadcn/ui CLI: `npx shadcn add button`
- Never manually create shadcn components

### 3. Imports
- Use `@/` path aliases
- Use `cn()` from `@/lib/utils` for class merging

### 4. Chrome APIs
- Never call Chrome APIs directly from popup/options/sidepanel
- Always use messaging via background script

```typescript
// ✅ Good
import { getTabInfo } from "@/lib/messaging"
const tab = await getTabInfo()

// ❌ Bad
chrome.tabs.query({ active: true })
```

---

## Feature-Based Architecture

Organize by **feature**, not by type. Each feature lives in `src/features/<name>/`.

### Feature Folder Structure
```
features/bookmarks/
├── types.ts              # Data structures
├── handlers.ts           # Background message handlers
├── BookmarkList.tsx      # UI component
└── index.ts              # Public exports
```

### Key Rules

1. **background.ts stays small** - Only imports handlers, no feature logic
2. **Handlers return null if not handled** - Allows chaining handlers
3. **One feature = one folder** - Don't scatter code across codebase
4. **Keep files small** - Split if: types > 50 lines, handlers > 100 lines, UI > 150 lines
5. **Features don't import each other** - Use message passing

### Example Handler
```typescript
export async function handleBookmarkMessage(type: string, payload: unknown) {
  switch (type) {
    case 'ADD_BOOKMARK':
      // ... handle
      return { success: true }
    case 'GET_BOOKMARKS':
      // ... handle
      return { bookmarks: [] }
    default:
      return null  // Not for this feature
  }
}
```

### Adding a Feature

1. Create folder `src/features/<name>/`
2. Add `types.ts`, `handlers.ts`, UI component, `index.ts`
3. Import handler in `background.ts` (2 lines)
4. Use component where needed

### Background.ts Pattern
```typescript
import { handleBookmarkMessage } from './features/bookmarks/handlers'
import { handleHistoryMessage } from './features/history/handlers'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handleMessage = async () => {
    // Try each feature
    const result = await handleBookmarkMessage(message.type, message)
    if (result !== null) return result

    const result2 = await handleHistoryMessage(message.type, message)
    if (result2 !== null) return result2

    // Core messages
    switch (message.type) {
      case 'GET_TAB_INFO': { /* ... */ }
    }
  }
  // ...
})
```

---

## Quick Reference

### Message Passing
```typescript
import { getTabInfo, getStorage, setStorage } from "@/lib/messaging"

const tab = await getTabInfo()
await setStorage('key', value)
const data = await getStorage<MyType>('key')
```

### Side Panel
```typescript
// openSidePanel() must be called directly from UI (requires user gesture)
// It's NOT in messaging.ts - import directly where needed
import { openSidePanel } from "@/lib/messaging"
await openSidePanel()
```

### State
```typescript
import { useAppStore, usePaymentStore, initPaymentListeners } from "@/store"

const { theme, toggleTheme } = useAppStore()
```

### Payment
```tsx
import { PaymentStatus, PaymentButton, PaymentGate } from "@/components/Payment"

<PaymentStatus />
<PaymentButton showTrial />
<PaymentGate>premium content</PaymentGate>
```

## Don't

- Put feature logic in `background.ts` (use handlers!)
- Let files grow too large (split them!)
- Import between features (use message passing!)
- Add custom CSS to `theme.css` (use Tailwind!)
- Call Chrome APIs directly from UI contexts
