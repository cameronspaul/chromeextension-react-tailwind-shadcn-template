import ExtPay from 'extpay'

const EXTENSION_PAY_ID = import.meta.env.VITE_EXTPAY_EXTENSION_ID || 'your-extension-id'
const extpay = ExtPay(EXTENSION_PAY_ID)

export type { User, Plan } from 'extpay'

export const getUser = () => extpay.getUser()
export const openPaymentPage = (plan?: string) => extpay.openPaymentPage(plan)
export const openTrialPage = (text?: string) => extpay.openTrialPage(text)
export const openLoginPage = () => extpay.openLoginPage()
export const onPaid = (cb: Parameters<typeof extpay.onPaid.addListener>[0]) => {
  extpay.onPaid.addListener(cb)
  return () => {}
}
export const onTrialStarted = (cb: Parameters<typeof extpay.onTrialStarted.addListener>[0]) => {
  extpay.onTrialStarted.addListener(cb)
  return () => {}
}
