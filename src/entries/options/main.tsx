import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../theme.css'
import Options from './Options'

// Options page entry point - Full settings page for the extension
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Options />
  </StrictMode>,
)
