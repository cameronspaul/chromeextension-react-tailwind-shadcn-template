import { useEffect } from 'react'
import { usePaymentStore, initPaymentListeners } from '../store'
import { openPaymentPage, openTrialPage, openLoginPage } from '../lib/extpay'
import { Button } from './ui/button'
import { Sparkles, Loader2 } from 'lucide-react'

// Payment status badge for header
export function PaymentStatus({ showDetails = false }: { showDetails?: boolean }) {
  const { isPaid, isLoading } = usePaymentStore()

  useEffect(() => {
    const cleanup = initPaymentListeners()
    return cleanup
  }, [])

  if (isLoading) {
    return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
  }

  if (isPaid) {
    return (
      <div className="flex items-center gap-1.5 text-green-500">
        <Sparkles className="h-3.5 w-3.5" />
        {showDetails && <span className="text-xs font-medium">Pro</span>}
      </div>
    )
  }

  return (
    <div className="text-xs text-muted-foreground">
      {showDetails ? 'Free' : null}
    </div>
  )
}

// Payment button with trial option
interface PaymentButtonProps {
  showTrial?: boolean
  trialText?: string
  showLogin?: boolean
  className?: string
}

export function PaymentButton({ 
  showTrial = true, 
  trialText = '7-day',
  showLogin = false,
  className = ''
}: PaymentButtonProps) {
  const { isPaid, user, isLoading } = usePaymentStore()

  if (isLoading) {
    return (
      <Button disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    )
  }

  if (isPaid) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">
          {user?.subscriptionStatus === 'active' ? 'Premium Active' : 'Trial Active'}
        </span>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Button 
        onClick={() => openPaymentPage()} 
        className="w-full"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Upgrade to Pro
      </Button>
      
      {showTrial && (
        <Button 
          variant="outline" 
          onClick={() => openTrialPage(trialText)}
          className="w-full"
        >
          Start {trialText} Free Trial
        </Button>
      )}
      
      {showLogin && (
        <Button 
          variant="ghost" 
          onClick={() => openLoginPage()}
          className="w-full text-sm"
        >
          Already paid? Sign in
        </Button>
      )}
    </div>
  )
}

// Gate content behind payment
interface PaymentGateProps {
  children: React.ReactNode
  showPaymentButton?: boolean
  allowTrial?: boolean
}

export function PaymentGate({ 
  children, 
  showPaymentButton = true,
  allowTrial = true 
}: PaymentGateProps) {
  const { isPaid, isLoading } = usePaymentStore()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isPaid) {
    return <>{children}</>
  }

  return (
    <div className="p-4 border border-dashed border-border rounded-lg bg-muted/50 space-y-3">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <span className="text-sm font-medium">Premium Feature</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Upgrade to access this feature.
      </p>
      {showPaymentButton && (
        <PaymentButton showTrial={allowTrial} className="!mt-3" />
      )}
    </div>
  )
}
