import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getUser, onPaid, onTrialStarted, type User } from './lib/extpay'

// App Store
interface AppState {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        document.documentElement.setAttribute('data-theme', newTheme)
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
      },
    }),
    { name: 'app-store' }
  )
)

// Payment Store
interface PaymentState {
  user: User | null
  isPaid: boolean
  isLoading: boolean
  checkStatus: () => Promise<void>
  setUser: (user: User) => void
}

const TRIAL_DAYS = 7
const isTrialActive = (trialStartedAt: Date | null) => {
  if (!trialStartedAt) return false
  const diff = Date.now() - new Date(trialStartedAt).getTime()
  return diff < TRIAL_DAYS * 24 * 60 * 60 * 1000
}

export const usePaymentStore = create<PaymentState>()((set) => ({
  user: null,
  isPaid: false,
  isLoading: false,

  checkStatus: async () => {
    set({ isLoading: true })
    try {
      const user = await getUser()
      const trialActive = isTrialActive(user.trialStartedAt)
      set({ user, isPaid: user.paid || trialActive })
    } catch (error) {
      console.error('Failed to check payment status:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  setUser: (user) => {
    const trialActive = isTrialActive(user.trialStartedAt)
    set({ user, isPaid: user.paid || trialActive })
  },
}))

// Initialize payment listeners
export function initPaymentListeners(): () => void {
  usePaymentStore.getState().checkStatus()
  const paidUnsub = onPaid((user) => usePaymentStore.getState().setUser(user))
  const trialUnsub = onTrialStarted((user) => usePaymentStore.getState().setUser(user))
  return () => {
    paidUnsub()
    trialUnsub()
  }
}
