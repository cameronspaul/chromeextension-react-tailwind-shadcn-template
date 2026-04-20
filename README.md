# Chrome Extension React Template

A modern, production-ready Chrome extension template built with **React 19**, **Vite**, **Tailwind CSS v4**, and **shadcn/ui**. This template provides a complete architecture for building Chrome extensions using Manifest V3 with full React support across all extension contexts.

## Features

- ⚛️ **React 19** - Latest React with concurrent features and automatic batching
- ⚡ **Vite** - Lightning-fast development and optimized production builds
- 🎨 **Tailwind CSS v4** - Modern utility-first styling with CSS-first configuration
- 🧩 **shadcn/ui** - Beautiful, accessible component primitives
- 📦 **Zustand** - Simple state management with Chrome storage persistence
- 🔄 **Chrome Storage API** - Persistent state across all extension contexts
- 📡 **Message Passing** - Typed, type-safe communication between contexts
- 🎯 **Manifest V3** - Latest Chrome extension standard
- 🌗 **Theme Support** - Built-in light/dark mode with CSS variables
- 📝 **TypeScript** - Full type safety throughout
- 🧪 **Shadow DOM** - Style isolation for injected components
- 💳 **ExtensionPay** - Built-in monetization with payments, trials & subscriptions

## Project Structure

```
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   └── icons/                 # Extension icons (16, 32, 48, 128px PNGs)
├── src/
│   ├── entries/               # Extension entry points
│   │   ├── background/        # Service worker
│   │   ├── content/           # Content script
│   │   ├── extpay-content/    # ExtensionPay content script
│   │   ├── options/           # Options page
│   │   ├── popup/             # Popup UI
│   │   └── sidepanel/         # Side panel
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── payment/           # Payment components (ExtPay)
│   ├── lib/                   # Utilities (storage, messaging, extpay)
│   ├── stores/                # Zustand stores
│   └── theme.css              # Tailwind theme configuration
├── vite.config.ts            # Vite configuration
└── package.json              # Dependencies & scripts
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Extension

```bash
npm run build:extension
```

This creates a `dist/` folder with all extension files.

### 3. Load in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select your `dist/` folder

### 4. Using the Extension

- **Click the extension icon** → Opens Popup
- **Right-click icon → Options** → Opens Settings Page
- **Ctrl+Shift+U** (or Cmd+Shift+U on Mac) → Opens Side Panel

### Available Scripts

```bash
npm run build           # Build extension files
npm run build:extension # Build + copy manifest/icons
npm run dev             # Dev server (web only, no Chrome APIs)
npm run clean           # Remove dist/
```

## Usage Guide

### Extension Entry Points

The template provides 5 extension entry points:

1. **Popup** (`src/entries/popup/`)
   - Shown when clicking the extension icon in the toolbar
   - Perfect for quick actions and status displays
   - Size: ~380x500px recommended

2. **Options Page** (`src/entries/options/`)
   - Full settings page accessible via right-click → Options
   - Or programmatically: `chrome.runtime.openOptionsPage()`

3. **Side Panel** (`src/entries/sidepanel/`)
   - Chrome's side panel feature - persistent UI alongside web pages
   - Open with `chrome.sidePanel.open()`

4. **Background Script** (`src/entries/background/`)
   - Service worker for Manifest V3
   - Handles events, message passing, storage
   - Cannot access DOM

5. **Content Script** (`src/entries/content/`)
   - Injected into web pages (configurable in manifest)
   - Can read/modify page DOM
   - Uses Shadow DOM for style isolation

### State Management

State is automatically synced across all contexts using Chrome Storage:

```typescript
import { useAppStore } from './stores/useAppStore'

function MyComponent() {
  const { theme, toggleTheme, settings, updateSettings } = useAppStore()
  
  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  )
}
```

### Message Passing

Communicate between contexts with type-safe messages:

```typescript
import { messageClient } from './lib/messaging'

// From popup/options/sidepanel to background
const tabInfo = await messageClient.getTabInfo()

// From popup to content script
await messageClient.highlightElement('#my-element')

// Direct storage access
import { chromeStorage } from './lib/storage'
await chromeStorage.set('settings', { theme: 'dark' })
const settings = await chromeStorage.get('settings')
```

## License

MIT License - feel free to use this template for any project!
