import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../../theme.css'
import Popup from './Popup'

// Popup entry point - This is what shows when you click the extension icon
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>,
)
