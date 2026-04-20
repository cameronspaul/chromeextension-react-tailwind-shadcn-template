import { useState } from 'react'
import { usePaymentStore } from '../../stores/usePaymentStore'
import { openPayment, openTrial, openLogin } from '../../lib/extpay'
import { Button } from '../ui/button'
import { motion } from 'framer-motion'
import { Lock, CreditCard, Gift, LogIn, Loader2 } from 'lucide-react'

interface PaymentButtonProps {
  /** Button variant style */
  variant?: 'default' | 'outline' | 'ghost'
  /** Show trial button alongside payment button */
  showTrial?: boolean
  /** Show login button for returning users */
  showLogin?: boolean
  /** Custom plan nickname to open directly */
  planNickname?: string
  /** Trial display text, e.g. '7-day' */
  trialText?: string
  /** Additional CSS classes */
  className?: string
  /** Called after payment page is opened */
  onOpen?: () => void
}

/**
 * PaymentButton Component
 * 
 * A ready-to-use button group for ExtensionPay integration.
 * Shows payment, trial, and/or login buttons based on props.
 * 
 * @example
 * ```tsx
 * <PaymentButton 
 *   showTrial 
 *   trialText="7-day"
 *   planNickname="pro-plan"
 * />
 * ```
 */
export function PaymentButton({
  variant = 'default',
  showTrial = false,
  showLogin = false,
  planNickname,
  trialText,
  className = '',
  onOpen,
}: PaymentButtonProps) {
  const { isCheckingStatus, isPaid, user } = usePaymentStore()
  const [isOpening, setIsOpening] = useState(false)

  const handlePayment = async () => {
    setIsOpening(true)
    try {
      await openPayment(planNickname)
      onOpen?.()
    } catch (error) {
      console.error('Failed to open payment page:', error)
    } finally {
      setIsOpening(false)
    }
  }

  const handleTrial = async () => {
    setIsOpening(true)
    try {
      await openTrial(trialText)
      onOpen?.()
    } catch (error) {
      console.error('Failed to open trial page:', error)
    } finally {
      setIsOpening(false)
    }
  }

  const handleLogin = async () => {
    setIsOpening(true)
    try {
      await openLogin()
      onOpen?.()
    } catch (error) {
      console.error('Failed to open login page:', error)
    } finally {
      setIsOpening(false)
    }
  }

  if (isCheckingStatus) {
    return (
      <Button disabled className={className}>
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        Checking...
      </Button>
    )
  }

  // If user is paid, show manage subscription option
  if (isPaid && user?.paid) {
    return (
      <Button
        variant="outline"
        onClick={handlePayment}
        disabled={isOpening}
        className={className}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        Manage Subscription
      </Button>
    )
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          variant={variant}
          onClick={handlePayment}
          disabled={isOpening}
          className="w-full"
        >
          {isOpening ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Lock className="h-4 w-4 mr-2" />
          )}
          Upgrade Now
        </Button>
      </motion.div>

      {showTrial && (
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            variant="outline"
            onClick={handleTrial}
            disabled={isOpening}
            className="w-full"
          >
            <Gift className="h-4 w-4 mr-2" />
            Start {trialText ? `${trialText} ` : ''}Free Trial
          </Button>
        </motion.div>
      )}

      {showLogin && (
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            variant="ghost"
            onClick={handleLogin}
            disabled={isOpening}
            className="w-full"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Already Paid? Log In
          </Button>
        </motion.div>
      )}
    </div>
  )
}
