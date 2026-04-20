import ExtPay from 'extpay'
import type { User, Plan } from 'extpay'

export type { User, Plan }

/**
 * ExtensionPay Configuration
 * 
 * IMPORTANT: Replace 'your-extension-id' with your actual ExtensionPay extension ID.
 * You can get this by signing up at https://extensionpay.com and creating an extension.
 */
const EXTENSION_PAY_ID = import.meta.env.VITE_EXTPAY_EXTENSION_ID || 'your-extension-id'

/**
 * Get the ExtensionPay instance
 * 
 * In Manifest V3 service workers, the `extpay` variable can become undefined
 * inside callbacks. Always call this function to get a fresh reference.
 * 
 * NEVER call `extpay.startBackground()` inside callbacks - it should only
 * be called once during service worker initialization.
 */
export function getExtPay(): ReturnType<typeof ExtPay> {
  return ExtPay(EXTENSION_PAY_ID)
}

/**
 * Initialize ExtensionPay in the background service worker
 * 
 * Call this once when the service worker starts.
 */
export function initExtPayBackground(): void {
  const extpay = getExtPay()
  extpay.startBackground()
  console.log('[ExtPay] Background initialized')
}

/**
 * Fetch the current user's payment status
 * 
 * This makes a network call to ExtensionPay servers.
 * Consider caching the result for UI display.
 */
export async function fetchUser(): Promise<User> {
  const extpay = getExtPay()
  return extpay.getUser()
}

/**
 * Fetch available payment plans
 */
export async function fetchPlans(): Promise<Plan[]> {
  const extpay = getExtPay()
  return extpay.getPlans()
}

/**
 * Open the payment page for the user to purchase or manage their subscription
 * 
 * Optionally pass a plan nickname to go directly to that plan's checkout.
 */
export async function openPayment(planNickname?: string): Promise<void> {
  const extpay = getExtPay()
  return extpay.openPaymentPage(planNickname)
}

/**
 * Open the free trial signup page
 * 
 * Optionally pass display text like '7-day' to customize the trial prompt.
 */
export async function openTrial(displayText?: string): Promise<void> {
  const extpay = getExtPay()
  return extpay.openTrialPage(displayText)
}

/**
 * Open the login page for users who have already paid
 */
export async function openLogin(): Promise<void> {
  const extpay = getExtPay()
  return extpay.openLoginPage()
}

/**
 * Register a callback to run when the user pays
 * 
 * This also fires when a user logs in on a new browser/device.
 * Requires the ExtPay content script in manifest.json.
 */
export function onPaid(callback: (user: User) => void): () => void {
  const extpay = getExtPay()
  extpay.onPaid.addListener(callback)
  
  // Return unsubscribe function
  return () => {
    // ExtPay doesn't support removing listeners directly,
    // but we can wrap if needed in the store layer
  }
}

/**
 * Register a callback to run when the user starts a free trial
 * 
 * Requires the ExtPay content script in manifest.json.
 */
export function onTrialStarted(callback: (user: User) => void): () => void {
  const extpay = getExtPay()
  extpay.onTrialStarted.addListener(callback)
  return () => {}
}

/**
 * Check if a user's trial is active
 * 
 * @param trialStartedAt - Date from user.trialStartedAt
 * @param durationMs - Trial duration in milliseconds (default: 7 days)
 */
export function isTrialActive(trialStartedAt: Date | null, durationMs = 1000 * 60 * 60 * 24 * 7): boolean {
  if (!trialStartedAt) return false
  const now = new Date()
  return (now.getTime() - new Date(trialStartedAt).getTime()) < durationMs
}

/**
 * Check if a subscription is in a valid paid state
 * 
 * Returns true for active subscriptions and past_due (grace period).
 * Returns false for canceled or unpaid users.
 */
export function isSubscriptionValid(user: User): boolean {
  if (!user.paid) return false
  // Active is fully paid, past_due is grace period
  if (user.subscriptionStatus && user.subscriptionStatus !== 'active' && user.subscriptionStatus !== 'past_due') {
    return false
  }
  return true
}
