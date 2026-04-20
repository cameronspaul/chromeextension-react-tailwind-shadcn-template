import { useEffect, type ReactNode } from 'react'
import { usePaymentStore } from '../../stores/usePaymentStore'
import { PaymentButton } from './PaymentButton'
import { motion } from 'framer-motion'
import { Lock, Crown, Loader2 } from 'lucide-react'

interface PaymentGateProps {
  /** Content to show when user has paid access */
  children: ReactNode
  /** Optional content to show while checking status */
  fallback?: ReactNode
  /** Optional custom locked state UI */
  lockedContent?: ReactNode
  /** Whether to show the payment button in the locked state */
  showPaymentButton?: boolean
  /** Allow trial users to see content */
  allowTrial?: boolean
  /** Plan nickname required for access (optional) */
  requiredPlan?: string
  /** Additional CSS for the locked container */
  className?: string
}

/**
 * PaymentGate Component
 * 
 * Conditionally renders children based on the user's payment status.
 * Shows a locked state UI when the user hasn't paid.
 * 
 * @example
 * ```tsx
 * <PaymentGate showPaymentButton allowTrial>
 *   <PremiumFeature />
 * </PaymentGate>
 * ```
 */
export function PaymentGate({
  children,
  fallback,
  lockedContent,
  showPaymentButton = true,
  allowTrial = true,
  requiredPlan,
  className = '',
}: PaymentGateProps) {
  const { isPaid, isTrialActive, isCheckingStatus, user } = usePaymentStore()

  useEffect(() => {
    // Check status on mount if not already loaded
    if (!user && !isCheckingStatus) {
      usePaymentStore.getState().checkStatus()
    }
  }, [user, isCheckingStatus])

  // Determine access
  const hasAccess = (() => {
    if (isPaid) return true
    if (allowTrial && isTrialActive) return true
    if (requiredPlan && user?.plan?.nickname === requiredPlan) return true
    return false
  })()

  // Loading state
  if (isCheckingStatus && !user) {
    if (fallback) return <>{fallback}</>
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Paid / has access
  if (hasAccess) {
    return <>{children}</>
  }

  // Locked state
  if (lockedContent) {
    return <>{lockedContent}</>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-xl border border-border bg-card ${className}`}
    >
      {/* Locked overlay background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] z-10" />
      
      {/* Locked content */}
      <div className="relative z-20 p-6 flex flex-col items-center text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Crown className="h-6 w-6 text-primary" />
        </div>
        
        <div className="space-y-1">
          <h3 className="font-semibold flex items-center justify-center gap-2">
            <Lock className="h-4 w-4" />
            Premium Feature
          </h3>
          <p className="text-sm text-muted-foreground max-w-[240px]">
            Upgrade to unlock this feature and get access to all premium tools.
          </p>
        </div>

        {showPaymentButton && (
          <PaymentButton 
            showTrial 
            trialText="7-day"
            className="w-full max-w-[240px]"
          />
        )}
      </div>

      {/* Blurred preview of children */}
      <div className="p-6 blur-[2px] select-none pointer-events-none opacity-50">
        {children}
      </div>
    </motion.div>
  )
}
