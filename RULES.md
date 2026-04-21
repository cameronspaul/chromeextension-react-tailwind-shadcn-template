# Project Rules

This document defines the coding standards for this **Chrome Extension React Template** built with React + Vite + Tailwind CSS + shadcn/ui.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix UI) |
| State | Zustand + Chrome Storage |
| Animation | Framer Motion |
| Language | TypeScript |

## Core Principles

### 1. Styling

- **Use Tailwind utility classes for all styling** - never write custom CSS in components
- **Only modify CSS variables** in `theme.css` (`:root` and `.dark`)
- **No separate `.css` files** for component styles

```tsx
// ✅ Good
<div className="flex items-center p-4 bg-card rounded-lg">

// ❌ Bad
<div className="my-custom-class">
```

### 2. Components

- **Always check shadcn/ui first** before building custom components
- **Use the CLI to add components:**
```bash
npx shadcn add button
npx shadcn add card dialog input
```
- **Never manually create** shadcn/ui components

### 3. Imports

- Use `@/` path aliases for all imports
- Use `cn()` from `@/lib/utils` for class merging

```tsx
// ✅ Good
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ❌ Bad
import { Button } from "../../components/ui/button"
```

### 4. Chrome APIs

- **Never call Chrome APIs directly** from popup/options/sidepanel
- **Always use messaging helpers** from `@/lib/messaging` to communicate via background script
- Background script has access to all Chrome APIs

```typescript
// ✅ Good - from popup/options/sidepanel
import { getTabInfo, openSidePanel } from "@/lib/messaging"
const tabInfo = await getTabInfo()

// ❌ Bad - directly calling Chrome APIs
chrome.tabs.query({ active: true })
```

### 5. Content Scripts

- Keep content scripts minimal - they inject into every page
- Use message passing to communicate with background
- Avoid heavy dependencies in content scripts

```typescript
// ✅ Good - simple content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_PAGE_INFO') {
    sendResponse({
      url: window.location.href,
      title: document.title
    })
  }
  return true
})
```

### 6. State Management

- Use stores from `store.ts` for global state
- State syncs across all contexts via Chrome Storage
- Use `partialize` to control what persists

```typescript
import { useAppStore } from '@/store'

const { theme, toggleTheme } = useAppStore()
```

## Extension Architecture

### Entry Points

| Context | Location | Purpose |
|---------|----------|---------|
| Popup | `src/entries/popup/` | Toolbar icon click UI |
| Options | `src/entries/options/` | Full settings page |
| Side Panel | `src/entries/sidepanel/` | Persistent side UI |
| Content Script | `src/content.ts` | Injected into web pages |
| Background | `src/background.ts` | Service worker |
| ExtPay Content | `src/extpay-content.ts` | Payment callbacks |

### Communication Flow

```
Popup/Options/Side Panel ←→ Background ←→ Content Script
                                    ↓
                              Web Page
```

All communication between contexts goes through the background script.

## Project Structure

```
public/
├── manifest.json          # Chrome extension manifest
└── icons/                 # Extension icons (16, 32, 48, 128px)

src/
├── entries/               # Extension UI entry points
│   ├── options/           # Settings page
│   ├── popup/             # Toolbar popup
│   └── sidepanel/         # Side panel
├── components/
│   ├── ui/                # shadcn/ui components
│   └── Payment.tsx        # Payment components
├── lib/
│   ├── extpay.ts          # ExtensionPay integration
│   ├── messaging.ts       # Message passing helpers
│   └── utils.ts           # Utility functions (cn, etc.)
├── background.ts          # Service worker
├── content.ts             # Content script
├── extpay-content.ts      # ExtensionPay content script
├── store.ts               # Zustand stores
└── theme.css              # Tailwind theme variables
```

## Icons

- **Lucide React** for UI icons
- **Simple Icons** for brand logos

```tsx
import { Sun, Moon, Settings } from 'lucide-react'
import { siReact, siVite } from 'simple-icons'
```

## Quick Reference

### Message Passing
```typescript
import { getTabInfo, getStorage, setStorage, openSidePanel } from "@/lib/messaging"

const tab = await getTabInfo()
await setStorage('key', value)
const data = await getStorage('key')
await openSidePanel()
```

### State
```typescript
import { useAppStore, usePaymentStore, initPaymentListeners } from "@/store"

const { theme, toggleTheme } = useAppStore()
const { isPaid, checkStatus } = usePaymentStore()

// Initialize payment listeners in components
useEffect(() => {
  const cleanup = initPaymentListeners()
  return cleanup
}, [])
```

### Payment Components
```tsx
import { PaymentStatus, PaymentButton, PaymentGate } from "@/components/Payment"

<PaymentStatus />                          // Badge showing free/paid status
<PaymentButton showTrial showLogin />      // Payment buttons
<PaymentGate>premium content</PaymentGate> // Gate content
```

## Don't

- Add custom CSS rules to `theme.css` beyond CSS variables
- Create separate `.css` files for components
- Manually create shadcn/ui components
- Call Chrome APIs directly from popup/options/sidepanel
- Add heavy dependencies to content scripts
- Request unnecessary permissions
