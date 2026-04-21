import { initBackground } from './init'
import { setupMessageListener } from './handlers/messages'
import { setupCommandListener } from './handlers/commands'
import { setupEventListeners } from './handlers/events'

/**
 * Background Service Worker - Chrome Extension Manifest V3
 *
 * This is the entry point. Each module handles a specific concern:
 * - init.ts          → Extension lifecycle (install, startup, defaults)
 * - handlers/messages.ts → Message passing between contexts
 * - handlers/commands.ts → Keyboard shortcuts
 * - handlers/events.ts   → Chrome API events (tabs, windows, storage)
 */

initBackground()
setupMessageListener()
setupCommandListener()
setupEventListeners()

console.log('Background service worker initialized')
