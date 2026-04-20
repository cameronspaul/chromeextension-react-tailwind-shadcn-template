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
- **Always use `messageClient`** from `@/lib/messaging` to communicate via background script
- Background script has access to all Chrome APIs

```typescript
// ✅ Good - from popup/options/sidepanel
import { messageClient } from "@/lib/messaging"
const tabInfo = await messageClient.getTabInfo()

// ❌ Bad - directly calling Chrome APIs
chrome.tabs.query({ active: true })
```

### 5. Content Scripts

- **Always use Shadow DOM** for style isolation
- Never modify page CSS directly
- Handle SPA navigation with MutationObserver

```typescript
import { createShadowRootUI } from './shadow-dom'

const container = document.createElement('div')
document.body.appendChild(container)
createShadowRootUI(container, 'MyComponent', props)
```

### 6. State Management

- Use Zustand store (`useAppStore`) for global state
- State syncs across all contexts via Chrome Storage
- Use `partialize` to control what persists

```typescript
persist(
  (set, get) => ({ ... }),
  {
    name: 'app-store',
    partialize: (state) => ({
      theme: state.theme,      // persisted
      settings: state.settings, // persisted
      // currentTab NOT persisted
    }),
  }
)
```

## Extension Architecture

### Entry Points

| Context | Location | Purpose |
|---------|----------|---------|
| Popup | `src/entries/popup/` | Toolbar icon click UI |
| Options | `src/entries/options/` | Full settings page |
| Side Panel | `src/entries/sidepanel/` | Persistent side UI |
| Content Script | `src/entries/content/` | Injected into web pages |
| Background | `src/entries/background/` | Service worker |

### Communication Flow

```
Popup/Options/Side Panel ←→ Background ←→ Content Script
                                    ↓
                              Web Page
```

All communication between contexts goes through the background script.

## Scripts

```bash
npm run dev             # Dev server (web only, no Chrome APIs)
npm run build           # TypeScript build + Vite build + post-build
npm run build:extension # Full build with manifest/icons copy
npm run clean           # Remove dist/
```

## Project Structure

```
public/
├── manifest.json          # Chrome extension manifest
└── icons/                 # Extension icons (16, 32, 48, 128px)

src/
├── entries/               # Extension entry points
│   ├── background/        # Service worker
│   ├── content/           # Content script
│   ├── options/           # Settings page
│   ├── popup/             # Toolbar popup
│   └── sidepanel/         # Side panel
├── components/
│   ├── ui/                # shadcn/ui components
│   └── ...                # Custom components
├── lib/
│   ├── messaging.ts       # Message passing system
│   ├── storage.ts         # Chrome storage adapter
│   └── utils.ts           # Utility functions (cn, etc.)
├── stores/
│   └── useAppStore.ts     # Zustand + Chrome storage
├── theme.css              # Tailwind theme variables
└── main.tsx               # Web dev entry
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
import { messageClient } from "@/lib/messaging"

const tab = await messageClient.getTabInfo()
await messageClient.setStorage('key', value)
await messageClient.openSidePanel()
await messageClient.highlightElement('#selector')
```

### Storage
```typescript
import { chromeStorage } from "@/lib/storage"

await chromeStorage.set('key', value)
const data = await chromeStorage.get('key')
chromeStorage.onChanged((changes) => console.log(changes))
```

### State
```typescript
import { useAppStore } from "@/stores/useAppStore"

const { theme, toggleTheme, settings, updateSettings } = useAppStore()
```

## Don't

- Add custom CSS rules to `theme.css`
- Create separate `.css` files for components
- Manually create shadcn/ui components
- Call Chrome APIs directly from popup/options/sidepanel
- Modify page styles without Shadow DOM isolation
- Request unnecessary permissions
