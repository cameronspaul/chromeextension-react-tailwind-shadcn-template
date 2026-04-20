# Chrome Extension React Template

A modern, production-ready Chrome extension template built with **React 19**, **Vite**, **Tailwind CSS v4**, and **shadcn/ui**. This template provides a complete architecture for building Chrome extensions using Manifest V3 with full React support across all extension contexts.

## ✨ Features

- ⚛️ **React 19** - Latest React with concurrent features and automatic batching
- ⚡ **Vite** - Lightning-fast development and optimized production builds
- 🎨 **Tailwind CSS v4** - Modern utility-first styling with CSS-first configuration
- 🧩 **shadcn/ui** - Beautiful, accessible component primitives
- 📦 **Zustand** - Simple, powerful state management with Chrome storage persistence
- 🔄 **Chrome Storage API** - Persistent state across all extension contexts
- 📡 **Message Passing** - Typed, type-safe communication between contexts
- 🎯 **Manifest V3** - Latest Chrome extension standard
- 🌗 **Theme Support** - Built-in light/dark mode with CSS variables
- 🎬 **Framer Motion** - Smooth animations and transitions
- 📝 **TypeScript** - Full type safety throughout
- 🧪 **Shadow DOM** - Style isolation for injected components

## 📁 Project Structure

```
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   └── icons/                 # Extension icons (16, 32, 48, 128px PNGs)
├── src/
│   ├── entries/               # Extension entry points
│   │   ├── background/        # Service worker
│   │   │   └── index.ts       # Background script
│   │   ├── content/           # Content script
│   │   │   ├── index.ts       # Content script entry
│   │   │   └── shadow-dom.tsx # Shadow DOM utilities
│   │   ├── options/           # Options page (full settings)
│   │   │   ├── index.html
│   │   │   ├── main.tsx
│   │   │   └── Options.tsx
│   │   ├── popup/             # Popup UI (toolbar icon click)
│   │   │   ├── index.html
│   │   │   ├── main.tsx
│   │   │   └── Popup.tsx
│   │   └── sidepanel/         # Side panel (Chrome feature)
│   │       ├── index.html
│   │       ├── main.tsx
│   │       └── SidePanel.tsx
│   ├── components/            # React components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                  # Utilities
│   │   ├── storage.ts        # Chrome storage adapter
│   │   └── messaging.ts      # Message passing system
│   ├── stores/               # Zustand stores
│   │   └── useAppStore.ts    # App state management
│   ├── pages/                # Page components (legacy web support)
│   ├── theme.css             # Tailwind theme configuration
│   └── App.tsx               # Main app (for web dev testing)
├── index.html                 # Web dev entry (for testing)
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies & scripts
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Extension

```bash
# Build extension for Chrome
npm run build:extension
```

This creates a `dist/` folder with all extension files.

### 3. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** in the top right
3. Click **Load unpacked**
4. Select the `dist` folder from your project

### 4. Using the Extension

- **Click the extension icon** → Opens Popup
- **Right-click icon → Options** → Opens Settings Page
- **Ctrl+Shift+U** (or Cmd+Shift+U on Mac) → Opens Side Panel

### 5. Development Mode (Web Only)

For testing UI components without Chrome APIs:
```bash
npm run dev
```

### Available Scripts

```bash
npm run build           # Build extension files
npm run build:extension # Build + copy manifest/icons
npm run dev             # Dev server (web only)
npm run clean           # Remove dist/
```

## 📖 Usage Guide

### Extension Entry Points

The template provides 5 extension entry points:

1. **Popup** (`src/entries/popup/`)
   - Shown when clicking the extension icon in the toolbar
   - Perfect for quick actions and status displays
   - Size: ~380x500px recommended

2. **Options Page** (`src/entries/options/`)
   - Full settings page
   - Access via right-click extension icon → Options
   - Or via `chrome.runtime.openOptionsPage()`

3. **Side Panel** (`src/entries/sidepanel/`)
   - Chrome's new side panel feature
   - Persistent UI alongside web pages
   - Open with `chrome.sidePanel.open()`

4. **Background Script** (`src/entries/background/`)
   - Service worker (Manifest V3)
   - Handles events, message passing, storage
   - Cannot access DOM

5. **Content Script** (`src/entries/content/`)
   - Injected into all web pages (configurable)
   - Can read/modify page DOM
   - Uses Shadow DOM for style isolation

### State Management with Zustand

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
import { messageClient, sendMessage } from './lib/messaging'

// From popup/options/sidepanel to background
const tabInfo = await messageClient.getTabInfo()

// From popup to content script
await messageClient.highlightElement('#my-element')

// From content script to background
chrome.runtime.sendMessage({ type: 'GET_STORAGE', key: 'myKey' })
```

### Chrome Storage API

Direct storage access with type safety:

```typescript
import { chromeStorage } from './lib/storage'

// Set data
await chromeStorage.set('settings', { theme: 'dark' })

// Get data
const settings = await chromeStorage.get('settings')

// Listen for changes
chromeStorage.onChanged((changes) => {
  console.log('Storage changed:', changes)
})
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

## 🔧 Configuration

### Chrome Extension Permissions

Edit `public/manifest.json` to add permissions:

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

### Vite Build Configuration

The `vite.config.ts` is configured for multi-page builds:

```typescript
build: {
  rollupOptions: {
    input: {
      popup: './src/entries/popup/index.html',
      options: './src/entries/options/index.html',
      sidepanel: './src/entries/sidepanel/index.html',
      background: './src/entries/background/index.ts',
      content: './src/entries/content/index.ts',
    },
  },
}
```

## 📝 Adding New Components

### Using shadcn/ui

```bash
# Add a new component
npx shadcn add button
npx shadcn add card
# etc...
```

### Custom Components

Create components in `src/components/`:

```typescript
// src/components/MyComponent.tsx
import { Button } from './ui/button'

export function MyComponent() {
  return <Button>Click me</Button>
}
```

## 🧪 Development & Debugging

### Hot Reload Workflow

1. Run `npm run build:extension` to build
2. Load `dist/` folder in Chrome
3. Make code changes
4. Rebuild with `npm run build:extension`
5. Click the refresh button on the extension in `chrome://extensions/`

### Debugging Tips

**Popup**: Right-click extension icon → Inspect popup

**Options**: Open options page → F12 for DevTools

**Background**: `chrome://extensions/` → Service Worker → Inspect

**Content Script**: Page DevTools → Sources → Content scripts

**Side Panel**: Side panel → Right-click → Inspect

### Console Locations

- **Popup**: Separate DevTools window
- **Options**: Standard page DevTools
- **Background**: Dedicated service worker console
- **Content Script**: Host page console
- **Side Panel**: Separate DevTools window

## 🐛 Common Issues

### "Cannot read property 'xxx' of undefined" in content script
- Ensure content script is loaded before sending messages
- Check if `chrome.runtime` is available

### Styles not applied in content script
- Use Shadow DOM via `createShadowRootUI()`
- Or inject styles manually into the shadow root

### State not syncing between contexts
- Ensure Zustand store is properly initialized
- Check Chrome Storage permissions in manifest

### Icons not showing
- Ensure all icon sizes (16, 32, 48, 128) are PNG format in `public/icons/`
- Convert the provided SVG to PNG using online tools

## 📦 Building for Distribution

```bash
# Build for Chrome Web Store
npm run build:extension

# Or with zip (on macOS/Linux)
npm run build:zip

# On Windows, manually zip the dist/ folder
```

### Chrome Web Store Requirements

1. **Icons**: Ensure all icon sizes are PNG format (convert SVGs)
2. **Screenshots**: Prepare 1280x800 or 640x400 screenshots
3. **Description**: Write compelling extension description
4. **Privacy Policy**: Required if using `tabs`, `history`, `bookmarks`, etc.

## 🎨 Customization

### Theme Colors

Edit `src/theme.css` to customize colors:

```css
:root {
  --primary: oklch(0.2050 0 0);
  /* ... more variables */
}

.dark {
  --primary: oklch(0.9220 0 0);
  /* ... more variables */
}
```

### Adding New Extension Pages

1. Create folder in `src/entries/`
2. Add `index.html` and `main.tsx`
3. Add entry point in `vite.config.ts`
4. Add to manifest if needed

## 📦 Adding Icons (Required for Chrome Web Store)

The extension needs PNG icons at these sizes:
- `public/icons/icon16.png`
- `public/icons/icon32.png`
- `public/icons/icon48.png`
- `public/icons/icon128.png`

You can convert the SVG in `public/icons/icon.svg` using online tools.

## 📋 Next Steps

1. **Add icons** - Convert SVG to PNG for Chrome Web Store
2. **Customize UI** - Edit components in `src/entries/`
3. **Add features** - Use `messageClient` for cross-context communication
4. **Publish** - Build and zip for Chrome Web Store

## 📚 Additional Documentation

- **Coding Rules**: See `RULES.md` for coding standards and patterns
- **Component Examples**: Check `src/entries/` for working examples

## 📚 Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/develop/migrate)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Zustand Documentation](https://docs.pmnd.rs/zustand)

## 📄 License

MIT License - feel free to use this template for any project!

---

Built with ❤️ using React + Vite + Tailwind CSS + shadcn/ui
