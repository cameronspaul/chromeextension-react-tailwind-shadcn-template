import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../theme.css'
import SidePanel from './SidePanel'

// Side Panel entry point - Chrome's new side panel feature
// Provides a persistent UI that stays open alongside web pages
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SidePanel />
  </StrictMode>,
)
