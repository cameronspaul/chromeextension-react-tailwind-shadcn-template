# Project Rules

This document defines the coding standards and constraints for this **Chrome Extension React Template** built with React + Vite + Tailwind CSS + shadcn/ui.

## Table of Contents

- [Chrome Extension Architecture](#chrome-extension-architecture)
- [Entry Points](#entry-points)
- [State Management](#state-management)
- [Message Passing](#message-passing)
- [Storage](#storage)
- [Styling](#styling)
- [Components](#components)
- [Project Structure](#project-structure)
- [Imports](#imports)
- [Icons](#icons)
- [Animations](#animations)
- [Build & Development](#build--development)

---

## Chrome Extension Architecture

### 1. Extension Contexts

This template provides **5 extension entry points** that run in separate contexts:

| Context | Location | Purpose | Chrome APIs |
|---------|----------|---------|-------------|
| **Popup** | `src/entries/popup/` | Toolbar icon click UI | Limited (via background) |
| **Options** | `src/entries/options/` | Full settings page | Limited (via background) |
| **Side Panel** | `src/entries/sidepanel/` | Persistent side UI | Limited (via background) |
| **Content Script** | `src/entries/content/` | Injected into web pages | `chrome.runtime.sendMessage` |
| **Background** | `src/entries/background/` | Service worker | **All Chrome APIs** |

### 2. Communication Flow

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Popup     │◄───►│              │◄───►│  Content Script │
│  Options    │     │  Background  │     │  (injected)     │
│ Side Panel  │     │  (Service    │     │                 │
└─────────────┘     │   Worker)    │     └─────────────────┘
                    │              │              │
                    │  • Storage   │              │
                    │  • Tabs      │              ▼
                    │  • Windows   │     ┌─────────────────┐
                    │  • APIs      │     │   Web Page      │
                    └──────────────┘     └─────────────────┘
```

**Rule:** Never call Chrome APIs directly from Popup/Options/Side Panel. Always use the `messageClient` or `sendMessage()` to communicate via the background script.

### 3. Permissions

Add required permissions to `public/manifest.json`:

```json
{
  "permissions": [
    "storage",
    "activeTab",
    "scripting",
    "tabs",
    "sidePanel",
    "notifications"
  ],
  "host_permissions": [
    "<all_urls>"
  ]
}
```

**Minimum permissions principle:** Only request permissions your extension actually needs.

---

## Entry Points

### 1. Creating New Entry Points

To add a new extension page:

1. Create folder in `src/entries/<name>/`
2. Add `index.html` with root div
3. Add `main.tsx` as entry point
4. Add `<Name>.tsx` as main component
5. Update `vite.config.ts` build inputs
6. Add to `public/manifest.json` if needed

```typescript
// src/entries/myfeature/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../theme.css'
import MyFeature from './MyFeature'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MyFeature />
  </StrictMode>,
)
```

### 2. Popup Specific Rules

- Keep UI compact (recommended: ~380x500px)
- Always call `window.close()` after opening side panel or options
- Use `chrome.action` APIs for badge/text updates

```typescript
// ✅ Good - close popup after navigation
const openSidePanel = async () => {
  const currentWindow = await chrome.windows.getCurrent()
  if (currentWindow.id) {
    await chrome.sidePanel.open({ windowId: currentWindow.id })
  }
  window.close()
}
```

### 3. Content Script Specific Rules

- Always use **Shadow DOM** for style isolation
- Never modify page CSS directly (use injected Shadow DOM)
- Handle SPA navigation changes with MutationObserver

```typescript
// ✅ Good - Shadow DOM injection
import { createShadowRootUI } from './shadow-dom'

const container = document.createElement('div')
document.body.appendChild(container)

createShadowRootUI(container, 'MyComponent', props)
```

---

## State Management

### 1. Zustand with Chrome Storage

State is automatically synced across all extension contexts:

```typescript
import { useAppStore } from '@/stores/useAppStore'

// ✅ Good - state syncs automatically across popup/options/sidepanel
const { theme, toggleTheme, settings, updateSettings } = useAppStore()

// Update state
updateSettings({ notifications: false })
// Automatically synced to all contexts via Chrome Storage
```

### 2. Store Structure

```typescript
// src/stores/useAppStore.ts
interface AppState {
  // Theme
  theme: 'light' | 'dark'
  setTheme: (theme: 'light' | 'dark') => void
  toggleTheme: () => void
  
  // Settings
  settings: {
    notifications: boolean
    autoSync: boolean
    sidebarOpen: boolean
  }
  updateSettings: (settings: Partial<AppState['settings']>) => void
  
  // Tab info (synced from content script)
  currentTab: { url: string; title: string; domain: string } | null
  setCurrentTab: (tab: AppState['currentTab']) => void
  
  // UI state (not persisted)
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}
```

### 3. Persisted vs Non-Persisted State

Use `partialize` to control what gets stored:

```typescript
persist(
  (set, get) => ({ ... }),
  {
    name: 'app-store',
    partialize: (state) => ({
      // Only these are persisted to Chrome Storage
      theme: state.theme,
      settings: state.settings,
      // currentTab and isLoading are NOT persisted
    }),
  }
)
```

---

## Message Passing

### 1. Using messageClient

The `messageClient` provides typed methods for common operations:

```typescript
import { messageClient } from '@/lib/messaging'

// Tab operations
const tabInfo = await messageClient.getTabInfo()

// Storage operations
await messageClient.setStorage('key', value)
const data = await messageClient.getStorage('key')

// Side panel
await messageClient.openSidePanel()

// Content script operations
await messageClient.highlightElement('#selector')
await messageClient.scrollToElement('#selector')
const { text } = await messageClient.getSelectedText()
```

### 2. Custom Messages

For custom operations, use `sendMessage`:

```typescript
import { sendMessage } from '@/lib/messaging'

// Define message type in messaging.ts first
const response = await sendMessage('MY_CUSTOM_MESSAGE', {
  payload: 'data'
})
```

### 3. Handling Messages in Background

```typescript
// src/entries/background/index.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const handleMessage = async () => {
    switch (message.type) {
      case 'MY_CUSTOM_MESSAGE':
        // Do something
        return { success: true, data: 'result' }
      
      default:
        throw new Error(`Unknown message: ${message.type}`)
    }
  }
  
  handleMessage()
    .then(sendResponse)
    .catch((error) => sendResponse({ error: error.message }))
  
  return true // Async response
})
```

---

## Storage

### 1. Chrome Storage API

Use the `chromeStorage` wrapper for direct storage access:

```typescript
import { chromeStorage } from '@/lib/storage'

// Get
const value = await chromeStorage.get('key')

// Set
await chromeStorage.set('key', value)

// Remove
await chromeStorage.remove('key')

// Clear all
await chromeStorage.clear()

// Listen for changes
chromeStorage.onChanged((changes) => {
  console.log('Storage changed:', changes)
})
```

### 2. Storage Areas

```typescript
import { chromeStorage, chromeSyncStorage } from '@/lib/storage'

// Local storage (device-specific)
await chromeStorage.set('localData', value)

// Sync storage (synced across devices)
await chromeSyncStorage.set('syncData', value)
```

### 3. Storage Limits

- `chrome.storage.local`: ~10MB (unlimited with `unlimitedStorage` permission)
- `chrome.storage.sync`: ~100KB, ~512 items

---

## Styling

### 1. Tailwind CSS Only

- **Use Tailwind utility classes for all styling needs.**
- **Never write custom CSS in `theme.css`** except for CSS variable definitions.
- **Never create `.css` files** for component-specific styles.

```tsx
// ✅ Good
<div className="flex items-center justify-between p-4 bg-card rounded-lg">

// ❌ Bad
<div className="my-custom-class">
// And then defining .my-custom-class in a separate CSS file
```

### 2. Theme Customization

The `src/theme.css` file contains CSS variables for theming. You may:

- Modify CSS variable values in `:root` and `.dark`
- Add new CSS variables if needed

You may NOT:

- Add custom CSS classes or rules
- Add `@apply` directives
- Add arbitrary CSS that belongs in component files

```css
/* ✅ Good - modifying CSS variables */
:root {
  --primary: oklch(0.6 0.2 250); /* Changed from default */
}

/* ❌ Bad - adding custom CSS rules */
.my-button {
  background: var(--primary);
  padding: 8px 16px;
}
```

### 3. Tailwind v4 Syntax

This project uses Tailwind CSS v4 with the `@theme inline` syntax. Theme values are mapped from CSS variables:

```css
@theme inline {
  --color-background: var(--background);
  --color-primary: var(--primary);
  /* ... */
}
```

Use the theme colors via Tailwind classes:

```tsx
// ✅ Good - using theme colors
<div className="bg-background text-foreground">
<div className="bg-primary text-primary-foreground">
<div className="border-border">
```

### 4. Extension-Specific Styling

**Popup sizing:**
```tsx
// Recommended popup size
<div className="w-[380px] min-h-[500px] bg-background">
```

**Side panel:**
```tsx
// Full height side panel
<div className="h-screen bg-background">
```

**Content script Shadow DOM:**
```tsx
// Use style isolation
const styleSheet = document.createElement('style')
styleSheet.textContent = `
  :host { all: initial; }
  /* Your isolated styles */
`
```

---

## Components

### 1. Always Use shadcn/ui First

**Before building any custom component, check if shadcn/ui has it.**

The shadcn/ui registry includes many pre-built components (dialog, dropdown, tabs, table, etc.). Always prefer these over building from scratch.

```tsx
// ✅ Good - using shadcn Dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

// ❌ Bad - building custom modal from scratch
function MyCustomModal({ isOpen, onClose, children }) {
  return <div className="fixed inset-0...">{children}</div>
}
```

### 2. Add shadcn Components via CLI

**Always use the CLI to add components:**

```bash
npx shadcn add button
npx shadcn add card dialog input
```

**Never manually create shadcn/ui components** - always use the CLI to ensure:
- Proper styling with Tailwind v4
- Correct accessibility attributes
- Consistent patterns
- Proper Radix UI integration

### 3. Component Location

- **shadcn/ui components**: `src/components/ui/`
- **Custom reusable components**: `src/components/`
- **Extension entry components**: `src/entries/<name>/<Name>.tsx`

### 4. Props Interface

Always define props interface, extending `React.ComponentProps` when appropriate:

```tsx
interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}
```

---

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
└── ...

scripts/
├── post-build.js          # Post-build file organization
├── zip-extension.js       # ZIP creation for distribution
└── clean.js               # Clean build artifacts
```

---

## Imports

### 1. Path Aliases

Always use the `@/` alias for imports:

```tsx
// ✅ Good
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores/useAppStore"
import { messageClient } from "@/lib/messaging"

// ❌ Bad
import { Button } from "../components/ui/button"
import { cn } from "../lib/utils"
```

### 2. Import Order

Organize imports in this order:

1. React imports
2. Third-party libraries
3. `@/` imports (components, hooks, utils, stores)
4. Relative imports (when necessary)
5. Type imports

```tsx
// ✅ Good
import * as React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Sun, Moon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAppStore } from "@/stores/useAppStore"
import { messageClient } from "@/lib/messaging"

import type { VariantProps } from "class-variance-authority"
```

---

## Icons

### 1. Lucide Icons (Primary)

The project is configured to use [Lucide React](https://lucide.dev/) for icons:

```tsx
import { Sun, Moon, Check, X, ChevronRight, Settings, Globe } from 'lucide-react'
```

### 2. Simple Icons (Brand Icons)

Use [Simple Icons](https://simpleicons.org/) for brand logos:

```tsx
import { siReact, siVite } from 'simple-icons'
```

### 3. Icon Sizing

Use Tailwind size utilities for consistent icon sizing:

```tsx
// ✅ Good
<Icon className="size-4" />     // Small
<Icon className="size-5" />     // Default
<Icon className="size-6" />     // Large
<Icon className="size-8" />     // Extra large
```

---

## Animations

### 1. Framer Motion (Primary)

The project includes [Framer Motion](https://www.framer.com/motion/) for animations. **Always consider adding animations** where appropriate to enhance UX.

**Common use cases:**
- Page/screen transitions
- Modal/dialog open/close animations
- List item entrance animations
- Hover/tap interactions
- Layout animations
- Scroll-triggered animations

```tsx
// ✅ Good - simple fade in animation
import { motion } from "framer-motion"

function Card({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="rounded-lg border bg-card p-6"
    >
      {children}
    </motion.div>
  )
}

// ✅ Good - staggered list animation
import { motion } from "framer-motion"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 },
}

function ItemList({ items }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {items.map((item) => (
        <motion.li key={item.id} variants={itemVariants}>
          {item.name}
        </motion.li>
      ))}
    </motion.ul>
  )
}
```

### 2. Animation Guidelines

**Do:**
- Use subtle, purposeful animations that guide attention
- Keep animations performant (use `transform` and `opacity` when possible)
- Use consistent timing (0.2s - 0.4s for micro-interactions)

**Don't:**
- Over-animate to the point of distraction
- Block user interactions with long animations
- Use heavy animations on low-end devices without testing

```tsx
// ✅ Good - reduced motion support
import { motion, useReducedMotion } from "framer-motion"

function AnimatedButton() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.button
      whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      Click me
    </motion.button>
  )
}
```

### 3. AnimatePresence for Exit Animations

Use `AnimatePresence` when components need exit animations (removing from DOM):

```tsx
// ✅ Good - modal with enter/exit animation
import { motion, AnimatePresence } from "framer-motion"

function Modal({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card p-6 rounded-lg"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

## Build & Development

### 1. Development Scripts

| Task | Command | Description |
|------|---------|-------------|
| Dev server | `npm run dev` | Web-only development (no Chrome APIs) |
| Build extension | `npm run build:extension` | Build + copy manifest/icons |
| Build ZIP | `npm run build:zip` | Create extension.zip for distribution |
| Clean | `npm run clean` | Remove dist/ and extension.zip |

### 2. Development Workflow

1. **Edit files** in `src/`
2. **Build** with `npm run build:extension`
3. **Load** the `dist/` folder in Chrome
4. **Test** your changes
5. **Refresh** the extension in `chrome://extensions/`

### 3. Build Output Structure

```
dist/
├── manifest.json          # Extension manifest
├── background.js          # Service worker
├── content.js             # Content script
├── popup.html / popup.js  # Popup entry
├── options.html / options.js  # Options entry
├── sidepanel.html / sidepanel.js  # Side panel entry
├── theme.css              # Styles
├── assets/                # Bundled assets
└── icons/                 # Extension icons
```

### 4. Loading in Chrome

1. Open `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` folder

### 5. Debugging

| Context | How to Debug |
|---------|--------------|
| **Popup** | Right-click extension icon → Inspect popup |
| **Options** | Open options page → F12 |
| **Background** | `chrome://extensions/` → Service Worker → Inspect |
| **Content Script** | Page DevTools → Sources → Content scripts |
| **Side Panel** | Right-click in panel → Inspect |

---

## Quick Reference

### Extension APIs via Message Passing

```typescript
// From any UI context (popup/options/sidepanel)
import { messageClient } from "@/lib/messaging"

// Tab info
const tab = await messageClient.getTabInfo()

// Storage
await messageClient.setStorage('key', value)
const data = await messageClient.getStorage('key')

// Side panel
await messageClient.openSidePanel()

// Content script
await messageClient.highlightElement('#selector')
await messageClient.scrollToElement('#selector')
const { text } = await messageClient.getSelectedText()
```

### Direct Storage Access

```typescript
import { chromeStorage } from "@/lib/storage"

await chromeStorage.set('key', value)
const data = await chromeStorage.get('key')
chromeStorage.onChanged((changes) => console.log(changes))
```

### State Management

```typescript
import { useAppStore } from "@/stores/useAppStore"

const { theme, toggleTheme, settings, updateSettings } = useAppStore()
```

---

## Summary

### ✅ Do

- Use Tailwind utility classes for all styling
- Always check shadcn/ui first before building custom components
- Use `npx shadcn add` for new UI components
- Use `@/` path aliases for imports
- Use `cn()` for class merging
- Use Lucide icons from `lucide-react`
- Use Zustand for global state
- Use Framer Motion for animations
- Use `messageClient` for Chrome API calls from UI contexts
- Use Chrome Storage for persistence
- Use Shadow DOM in content scripts
- Request minimum necessary permissions

### ❌ Don't

- Never add custom CSS rules to `theme.css`
- Never create separate `.css` files for components
- Never manually create shadcn/ui components
- Never call Chrome APIs directly from popup/options/sidepanel
- Never modify page styles without Shadow DOM isolation
- Never use `eval()` or `new Function()` in content scripts
- Never request unnecessary permissions

---

## Chrome Extension Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/develop/migrate)
- [Message Passing](https://developer.chrome.com/docs/extensions/mv3/messaging/)
- [Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [Side Panel API](https://developer.chrome.com/docs/extensions/reference/sidePanel/)
