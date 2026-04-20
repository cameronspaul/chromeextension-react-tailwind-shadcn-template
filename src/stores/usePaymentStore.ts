import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  fetchUser,
  fetchPlans,
  onPaid,
  onTrialStarted,
  isTrialActive,
  type User,
  type Plan
} from '../lib/extpay'

/**
 * ExtensionPay Payment Store
 * 
 * Manages payment state across all extension contexts using Zustand.
 * Syncs with ExtensionPay servers and caches user status locally.
 */

interface PaymentState {
  // User payment data
  user: User | null
  plans: Plan[]
  
  // Loading states
  isLoading: boolean
  isCheckingStatus: boolean
  error: string | null
  
  // Computed-like flags (derived from user)
  isPaid: boolean
  isTrialActive: boolean
  hasSubscription: boolean
  
  // Actions
  checkStatus: () => Promise<void>
  refreshPlans: () => Promise<void>
  resetError: () => void
  
  // Internal
  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const TRIAL_DURATION_MS = 1000 * 60 * 60 * 24 * 7 // 7 days default

export const usePaymentStore = create<PaymentState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      user: null,
      plans: [],
      isLoading: false,
      isCheckingStatus: false,
      error: null,
      isPaid: false,
      isTrialActive: false,
      hasSubscription: false,
      
      // Check the user's payment status from ExtensionPay
      checkStatus: async () => {
        set((state) => {
          state.isCheckingStatus = true
          state.error = null
        })
        
        try {
          const user = await fetchUser()
          get().setUser(user)
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to check payment status'
          })
          console.error('[PaymentStore] Error checking status:', error)
        } finally {
          set((state) => {
            state.isCheckingStatus = false
          })
        }
      },
      
      // Refresh available payment plans
      refreshPlans: async () => {
        set((state) => {
          state.isLoading = true
          state.error = null
        })
        
        try {
          const plans = await fetchPlans()
          set((state) => {
            state.plans = plans
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch plans'
          })
          console.error('[PaymentStore] Error fetching plans:', error)
        } finally {
          set((state) => {
            state.isLoading = false
          })
        }
      },
      
      // Update user and derived state
      setUser: (user) => {
        const trialActive = isTrialActive(user.trialStartedAt, TRIAL_DURATION_MS)
        const paid = user.paid || trialActive
        
        set((state) => {
          state.user = user
          state.isPaid = paid
          state.isTrialActive = trialActive
          state.hasSubscription = !!user.plan
        })
      },
      
      setLoading: (loading) => {
        set((state) => {
          state.isLoading = loading
        })
      },
      
      setError: (error) => {
        set((state) => {
          state.error = error
        })
      },
      
      resetError: () => {
        set((state) => {
          state.error = null
        })
      },
    }))
  )
)

/**
 * Initialize payment listeners
 * 
 * Call this in your popup/options/sidepanel entry points to:
 * 1. Check initial payment status
 * 2. Listen for payment events from ExtensionPay
 */
export function initPaymentListeners(): () => void {
  // Check status immediately
  usePaymentStore.getState().checkStatus()
  
  // Listen for payment events
  // Note: These require the ExtPay content script in manifest.json
  const paidUnsub = onPaid((user) => {
    console.log('[PaymentStore] User paid:', user)
    usePaymentStore.getState().setUser(user)
  })
  
  const trialUnsub = onTrialStarted((user) => {
    console.log('[PaymentStore] Trial started:', user)
    usePaymentStore.getState().setUser(user)
  })
  
  // Return cleanup function
  return () => {
    paidUnsub()
    trialUnsub()
  }
}

/**
 * Subscribe to payment status changes
 */
export function subscribeToPaymentStatus(
  callback: (isPaid: boolean) => void
): () => void {
  return usePaymentStore.subscribe(
    (state) => state.isPaid,
    (isPaid) => callback(isPaid)
  )
}

export default usePaymentStore
