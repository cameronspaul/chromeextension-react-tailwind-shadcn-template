/**
 * ExtPay Content Script
 * 
 * This content script runs on extensionpay.com pages and enables
 * the onPaid and onTrialStarted callbacks to work across all
 * extension contexts (popup, options, side panel).
 * 
 * Required by ExtensionPay for payment event notifications.
 * See: https://github.com/glench/ExtPay.js
 */

import 'extpay'

console.log('[ExtPay Content Script] Initialized on extensionpay.com')
