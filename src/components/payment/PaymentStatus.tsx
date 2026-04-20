import { useEffect } from 'react'
import { usePaymentStore } from '../../stores/usePaymentStore'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'

interface PaymentStatusProps {
  /** Show detailed plan information */
  showDetails?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * PaymentStatus Component
 * 
 * Displays the current user's payment status with an icon and label.
 * Useful for showing subscription state in headers or settings.
 * 
 * @example
 * ```tsx
 * <PaymentStatus showDetails />
 * ```
 */
export function PaymentStatus({ showDetails = false, className = '' }: PaymentStatusProps) {
  const { user, isPaid, isTrialActive, isCheckingStatus, error } = usePaymentStore()

  useEffect(() => {
    if (!user && !isCheckingStatus) {
      usePaymentStore.getState().checkStatus()
    }
  }, [user, isCheckingStatus])

  if (isCheckingStatus && !user) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking status...
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-sm text-destructive ${className}`}>
        <AlertCircle className="h-4 w-4" />
        Status unavailable
      </div>
    )
  }

  // Paid user
  if (isPaid && user?.paid) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 ${className}`}
      >
        <CheckCircle className="h-4 w-4 text-green-500" />
        <span className="text-sm font-medium text-green-600">
          Premium Active
        </span>
        {showDetails && user.plan && (
          <span className="text-xs text-muted-foreground">
            ({user.plan.nickname || `${user.plan.currency.toUpperCase()} ${user.plan.unitAmountCents / 100}/${user.plan.interval}`})
          </span>
        )}
      </motion.div>
    )
  }

  // Trial user
  if (isTrialActive && user?.trialStartedAt) {
    const daysLeft = Math.max(0, Math.ceil(
      (7 * 24 * 60 * 60 * 1000 - (Date.now() - new Date(user.trialStartedAt).getTime())) / (1000 * 60 * 60 * 24)
    ))
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 ${className}`}
      >
        <Clock className="h-4 w-4 text-amber-500" />
        <span className="text-sm font-medium text-amber-600">
          Trial ({daysLeft}d left)
        </span>
      </motion.div>
    )
  }

  // Free user
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <CreditCard className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        Free Plan
      </span>
    </div>
  )
}
