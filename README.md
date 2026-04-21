# Chrome Extension React Template

A modern, production-ready Chrome extension template built with **React 19**, **Vite**, **Tailwind CSS v4**, and **shadcn/ui**. This template provides a complete architecture for building Chrome extensions using Manifest V3 with full React support across all extension contexts.

## Features

- ⚛️ **React 19** - Latest React with concurrent features and automatic batching
- ⚡ **Vite** - Lightning-fast development and optimized production builds
- 🎨 **Tailwind CSS v4** - Modern utility-first styling with CSS-first configuration
- 🧩 **shadcn/ui** - Beautiful, accessible component primitives
- 📦 **Zustand** - Simple state management with Chrome storage persistence
- 🔄 **Chrome Storage API** - Persistent state across all extension contexts
- 📡 **Message Passing** - Simple communication between contexts
- 🎯 **Manifest V3** - Latest Chrome extension standard
- 🌗 **Theme Support** - Built-in light/dark mode with CSS variables
- 📝 **TypeScript** - Full type safety throughout
- 💳 **ExtensionPay** - Built-in monetization with payments, trials & subscriptions

## Project Structure

```
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   └── icons/                 # Extension icons (16, 32, 48, 128px PNGs)
├── src/
│   ├── entries/               # Extension UI entry points
│   │   ├── options/           # Options/settings page
│   │   ├── popup/             # Popup UI (toolbar icon click)
│   │   └── sidepanel/         # Side panel
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   └── Payment.tsx        # Payment components (ExtPay)
│   ├── lib/                   # Utilities
│   │   ├── extpay.ts          # ExtensionPay integration
│   │   ├── messaging.ts       # Message passing helpers
│   │   └── utils.ts           # Utility functions
│   ├── background.ts          # Service worker (background script)
│   ├── content.ts             # Content script (injected into pages)
│   ├── extpay-content.ts      # ExtensionPay content script
│   ├── store.ts               # Zustand stores (app + payment)
│   └── theme.css              # Tailwind theme configuration
├── vite.config.ts             # Vite configuration
└── package.json               # Dependencies & scripts
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Extension

```bash
npm run build
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
npm run dev             # Dev server (web only, no Chrome APIs)
npm run clean           # Remove dist/
```

## Usage Guide

### Extension Entry Points

The template provides 6 extension entry points:

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

4. **Background Script** (`src/background.ts`)
   - Service worker for Manifest V3
   - Handles events, message passing, storage
   - Cannot access DOM

5. **Content Script** (`src/content.ts`)
   - Injected into web pages (configurable in manifest)
   - Can read/modify page DOM

6. **ExtPay Content Script** (`src/extpay-content.ts`)
   - Required for ExtensionPay payment callbacks
   - Runs on extensionpay.com pages

### State Management

State is automatically synced across all contexts using Chrome Storage:

```typescript
import { useAppStore, usePaymentStore } from './store'

function MyComponent() {
  const { theme, toggleTheme } = useAppStore()
  const { isPaid, checkStatus } = usePaymentStore()

  return (
    <button onClick={toggleTheme}>
      Current theme: {theme}
    </button>
  )
}
```

### Message Passing

Communicate between contexts with simple messages:

```typescript
import { getTabInfo, setStorage, openSidePanel } from './lib/messaging'

// Get current tab info (goes through background)
const tabInfo = await getTabInfo()

// Access storage
await setStorage('settings', { theme: 'dark' })
const settings = await getStorage('settings')

// Open side panel
await openSidePanel()
```

### Payment Integration

The template includes ExtensionPay for monetization:

```tsx
import { PaymentStatus, PaymentButton, PaymentGate } from './components/Payment'

// Show payment status badge
<PaymentStatus />

// Payment button with trial option
<PaymentButton showTrial trialText="7-day" />

// Gate content behind payment
<PaymentGate>
  <PremiumFeature />
</PaymentGate>
```

Configure your ExtensionPay ID in `.env`:
```
VITE_EXTPAY_EXTENSION_ID=your-extension-id
```

## License

MIT License - feel free to use this template for any project!
