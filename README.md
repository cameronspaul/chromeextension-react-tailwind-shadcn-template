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

## Project Structure

```
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   └── icons/                 # Extension icons (16, 32, 48, 128px PNGs)
├── src/
│   ├── entries/               # Extension entry points
│   │   ├── background/        # Service worker
│   │   ├── content/           # Content script
│   │   ├── options/           # Options page
│   │   ├── popup/             # Popup UI
│   │   └── sidepanel/         # Side panel
│   ├── components/ui/         # shadcn/ui components
│   ├── lib/                   # Utilities (storage, messaging)
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

### Content Script - Shadow DOM

Inject React components with style isolation:

```typescript
import { createShadowRootUI, removeAllInjectedUI } from './entries/content/shadow-dom'

// Inject component
const { shadow, root } = createShadowRootUI(
  container,
  'MyComponent',
  { foo: 'bar' }
)

// Remove all injected UI
removeAllInjectedUI()
```

## Adding Components

### Using shadcn/ui

```bash
npx shadcn add button
npx shadcn add card
npx shadcn add dialog
```

### Custom Components

Create components in `src/components/`:

```typescript
import { Button } from './ui/button'

export function MyComponent() {
  return <Button>Click me</Button>
}
```

## Development & Debugging

### Workflow

1. Run `npm run build:extension` to build
2. Load `dist/` folder in Chrome (first time only)
3. Make code changes
4. Rebuild with `npm run build:extension`
5. Click the refresh icon on your extension in `chrome://extensions/`

### Debugging

- **Popup**: Right-click extension icon → Inspect popup
- **Options**: Open options page → F12 for DevTools
- **Background**: `chrome://extensions/` → Service Worker → Inspect
- **Content Script**: Page DevTools → Sources → Content scripts
- **Side Panel**: Right-click in panel → Inspect

Each context has its own console - check all when debugging!

## Chrome Web Store

### Required Icons

Add PNG icons at these sizes (convert the SVG in `public/icons/`):
- `public/icons/icon16.png`
- `public/icons/icon32.png`
- `public/icons/icon48.png`
- `public/icons/icon128.png`

### Building for Distribution

```bash
npm run build:extension
# Then zip the dist/ folder for upload
```

### Publishing Checklist

1. **Icons**: All sizes in PNG format
2. **Screenshots**: Prepare 1280x800 or 640x400 screenshots
3. **Description**: Write compelling extension description
4. **Privacy Policy**: Required if using `tabs`, `history`, `bookmarks`, etc.

## Customization

### Extension Name/Permissions

Edit `public/manifest.json`:

```json
{
  "name": "Your Extension Name",
  "description": "Your description",
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ]
}
```

### Theme Colors

Edit `src/theme.css` to customize colors:

```css
:root {
  --primary: oklch(0.2050 0 0);
}

.dark {
  --primary: oklch(0.9220 0 0);
}
```

## License

MIT License - feel free to use this template for any project!
