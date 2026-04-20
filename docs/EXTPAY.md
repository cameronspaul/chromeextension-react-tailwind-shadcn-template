# ExtensionPay Integration Guide

This template comes with **[ExtensionPay](https://extensionpay.com)** built-in, enabling you to monetize your Chrome extension with minimal setup. ExtensionPay is an open-source API that handles payments, trials, subscriptions, and multi-device login.

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Architecture](#architecture)
- [React Components](#react-components)
- [Zustand Store](#zustand-store)
- [API Reference](#api-reference)
- [Testing Payments](#testing-payments)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Quick Start

### 1. Get Your Extension ID

1. Sign up at [ExtensionPay.com](https://extensionpay.com)
2. Create a new extension
3. Copy your extension ID (e.g., `my-awesome-extension`)

### 2. Configure Your Extension ID

Set your ExtensionPay ID in your environment or directly in `src/lib/extpay.ts`:

```typescript
// src/lib/extpay.ts
const EXTENSION_PAY_ID = 'your-extension-id'
```

Or use an environment variable:

```bash
# .env
VITE_EXTPAY_EXTENSION_ID=your-extension-id
```

### 3. Set Up Stripe

1. Connect your Stripe account on ExtensionPay.com
2. Create payment plans (monthly, yearly, one-time)
3. Configure trial periods if desired

### 4. Build and Test

```bash
npm run build
```

Load the extension in Chrome and test payments using [Stripe test cards](https://docs.stripe.com/testing).

## Configuration

### Manifest Permissions

The template already includes the required permissions in `public/manifest.json`:

```json
{
  "permissions": ["storage"],
  "host_permissions": ["https://extensionpay.com/*"]
}
```

> For Firefox, you may need to add `"https://extensionpay.com/*"` to the `permissions` array as well.

### Content Security Policy

If you have a custom `content_security_policy` in your manifest and see `Refused to connect to 'https://extensionpay.com...'` errors, add this to your CSP:

```
connect-src https://extensionpay.com
```

## Architecture

The integration is organized into several layers:

```
src/
├── lib/extpay.ts              # Core ExtPay wrapper & utilities
├── stores/usePaymentStore.ts  # Zustand store for reactive state
├── components/payment/        # Reusable React components
│   ├── PaymentGate.tsx        # Feature gating component
│   ├── PaymentButton.tsx      # Payment action buttons
│   └── PaymentStatus.tsx      # Status badge/display
├── entries/
│   ├── background/index.ts    # Service worker initialization
│   └── extpay-content/        # Content script for callbacks
```

### Background Service Worker

The background script initializes ExtPay once on startup:

```typescript
// src/entries/background/index.ts
import { initExtPayBackground } from '../../lib/extpay'

// Call once when service worker starts
initExtPayBackground()
```

**Important MV3 Note**: In Manifest V3 service workers, the `extpay` variable can become `undefined` inside callbacks. Always use `getExtPay()` to get a fresh reference:

```typescript
import { getExtPay } from '../../lib/extpay'

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const extpay = getExtPay() // Get fresh reference
  // ... use extpay here
})
```

Never call `startBackground()` inside callbacks.

### Content Script

A dedicated content script runs on `https://extensionpay.com/*` to enable `onPaid` and `onTrialStarted` callbacks. This is already configured in the manifest and Vite build.

## React Components

### PaymentGate

Conditionally render content based on payment status:

```tsx
import { PaymentGate } from './components/payment'

function MyComponent() {
  return (
    <PaymentGate showPaymentButton allowTrial>
      <PremiumFeature />
    </PaymentGate>
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Content shown when paid |
| `showPaymentButton` | `boolean` | `true` | Show upgrade button when locked |
| `allowTrial` | `boolean` | `true` | Allow trial users to see content |
| `requiredPlan` | `string` | - | Require specific plan nickname |
| `lockedContent` | `ReactNode` | - | Custom locked state UI |

### PaymentButton

Ready-to-use payment action buttons:

```tsx
import { PaymentButton } from './components/payment'

function PricingPage() {
  return (
    <PaymentButton
      showTrial
      trialText="7-day"
      showLogin
      planNickname="pro-plan"
    />
  )
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'outline' \| 'ghost' \| 'subtle'` | `'default'` | Button style |
| `showTrial` | `boolean` | `false` | Show trial signup button |
| `showLogin` | `boolean` | `false` | Show login button |
| `planNickname` | `string` | - | Direct link to specific plan |
| `trialText` | `string` | - | Custom trial duration text |

### PaymentStatus

Display the current subscription status:

```tsx
import { PaymentStatus } from './components/payment'

function Header() {
  return <PaymentStatus showDetails />
}
```

## Zustand Store

The `usePaymentStore` provides reactive payment state across all contexts:

```tsx
import { usePaymentStore } from './stores/usePaymentStore'

function MyComponent() {
  const { user, isPaid, isTrialActive, checkStatus } = usePaymentStore()

  return (
    <div>
      {isPaid ? 'Premium' : 'Free'}
      <button onClick={checkStatus}>Refresh</button>
    </div>
  )
}
```

**Store State:**

| Property | Type | Description |
|----------|------|-------------|
| `user` | `User \| null` | Full user object from ExtPay |
| `plans` | `Plan[]` | Available payment plans |
| `isPaid` | `boolean` | User has paid or active trial |
| `isTrialActive` | `boolean` | Trial is within valid period |
| `hasSubscription` | `boolean` | User has a subscription plan |
| `isCheckingStatus` | `boolean` | Loading state |
| `error` | `string \| null` | Error message |

**Actions:**

| Action | Description |
|--------|-------------|
| `checkStatus()` | Fetch latest user status from ExtPay |
| `refreshPlans()` | Fetch available payment plans |
| `resetError()` | Clear error state |

### Initialization

Call `initPaymentListeners()` in your entry points to set up real-time payment event handling:

```tsx
import { initPaymentListeners } from './stores/usePaymentStore'

useEffect(() => {
  const cleanup = initPaymentListeners()
  return cleanup
}, [])
```

This:
1. Checks initial payment status
2. Listens for `onPaid` events
3. Listens for `onTrialStarted` events

## API Reference

### Core Functions (`src/lib/extpay.ts`)

```typescript
// Get ExtPay instance (MV3 safe)
getExtPay(): ExtPay

// Initialize background (call once)
initExtPayBackground(): void

// Fetch user status
fetchUser(): Promise<User>

// Fetch available plans
fetchPlans(): Promise<Plan[]>

// Open payment page
openPayment(planNickname?: string): Promise<void>

// Open trial signup
openTrial(displayText?: string): Promise<void>

// Open login page
openLogin(): Promise<void>

// Register payment callback
onPaid(callback: (user: User) => void): () => void

// Register trial callback
onTrialStarted(callback: (user: User) => void): () => void

// Check if trial is active
isTrialActive(trialStartedAt: Date | null, durationMs?: number): boolean

// Check subscription validity
isSubscriptionValid(user: User): boolean
```

### User Object

```typescript
interface User {
  paid: boolean
  paidAt: Date | null
  email: string | null
  installedAt: Date
  trialStartedAt: Date | null
  plan: Plan | null
  subscriptionStatus?: 'active' | 'past_due' | 'canceled'
  subscriptionCancelAt?: Date | null
}
```

### Plan Object

```typescript
interface Plan {
  unitAmountCents: number
  currency: string
  nickname: string | null
  interval: 'month' | 'year' | 'once'
  intervalCount: number | null
}
```

## Testing Payments

### Development Mode

While developing, ExtensionPay runs in test mode:

1. Open your payment page
2. Enter your ExtensionPay account password when prompted
3. Use [Stripe test cards](https://docs.stripe.com/testing):
   - `4242 4242 4242 4242` - Successful payment
   - `4000 0000 0000 0002` - Declined payment
   - Any future expiry date, any 3-digit CVC, any ZIP

### Resetting Test State

To reset your extension's paid status during development:

1. Go to your extension settings on ExtensionPay.com
2. Find the "Test Mode" section
3. Click "Reset Payment Status"

### Testing Free Trials

1. Call `openTrial()` to open the trial page
2. Enter an email address
3. Check your email and click the confirmation link
4. The `trialStartedAt` field will be populated

## Common Patterns

### Freemium Model

Show free features to everyone, gate premium ones:

```tsx
function App() {
  return (
    <div>
      <FreeFeature />
      
      <PaymentGate allowTrial>
        <PremiumFeature1 />
      </PaymentGate>
      
      <PaymentGate allowTrial>
        <PremiumFeature2 />
      </PaymentGate>
    </div>
  )
}
```

### Trial Countdown

Show users how much trial time they have left:

```tsx
function TrialBanner() {
  const { user, isTrialActive } = usePaymentStore()

  if (!isTrialActive || !user?.trialStartedAt) return null

  const daysLeft = Math.ceil(
    (7 * 24 * 60 * 60 * 1000 - 
    (Date.now() - new Date(user.trialStartedAt).getTime())) / 
    (1000 * 60 * 60 * 24)
  )

  return (
    <div className="bg-amber-100 p-3 rounded">
      {daysLeft} days left in your trial
    </div>
  )
}
```

### Plan-Specific Features

Require a specific plan for certain features:

```tsx
<PaymentGate requiredPlan="enterprise">
  <EnterpriseFeature />
</PaymentGate>
```

### Post-Purchase Actions

Run code when a user pays:

```tsx
import { onPaid } from './lib/extpay'

useEffect(() => {
  const unsubscribe = onPaid((user) => {
    // Send welcome email, unlock features, etc.
    console.log('User paid!', user.email)
  })
  return unsubscribe
}, [])
```

### Message Passing from Background

The messaging system includes payment-related messages:

```typescript
import { messageClient } from './lib/messaging'

// Get payment status
const { user } = await messageClient.getPaymentStatus()

// Get available plans
const { plans } = await messageClient.getPaymentPlans()

// Open payment page
await messageClient.openPaymentPage('pro-plan')

// Open trial page
await messageClient.openTrialPage('7-day')

// Open login page
await messageClient.openLoginPage()
```

## Troubleshooting

### "Refused to connect to extensionpay.com"

Add `connect-src https://extensionpay.com` to your manifest's `content_security_policy`.

### onPaid callbacks not firing

Ensure the ExtPay content script is in your manifest:

```json
{
  "content_scripts": [
    {
      "matches": ["https://extensionpay.com/*"],
      "js": ["extpay-content.js"],
      "run_at": "document_start"
    }
  ]
}
```

### Service worker errors

Never store `extpay` in a variable at the top level and use it in callbacks:

```typescript
// BAD - extpay becomes undefined in callbacks
const extpay = ExtPay('my-extension')
extpay.startBackground()

chrome.runtime.onMessage.addListener(() => {
  extpay.getUser() // ERROR: extpay is undefined
})

// GOOD - get fresh reference each time
import { getExtPay } from './lib/extpay'

chrome.runtime.onMessage.addListener(() => {
  const extpay = getExtPay() // Fresh reference
  extpay.getUser() // Works!
})
```

### Firefox compatibility

Add `https://extensionpay.com/*` to the `permissions` array (not just `host_permissions`) in your manifest.

## Resources

- [ExtensionPay Documentation](https://extensionpay.com)
- [ExtPay.js GitHub](https://github.com/glench/ExtPay.js)
- [Stripe Testing Guide](https://docs.stripe.com/testing)
- [Chrome Extension Payments Guide](https://developer.chrome.com/docs/webstore/monetize)
