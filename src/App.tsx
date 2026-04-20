import { useEffect } from 'react'
import { BrowserRouter, Routes } from 'react-router-dom'
import { useAppStore } from './stores/useAppStore'
function App() {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  return (
    <BrowserRouter>
      <Routes />
    </BrowserRouter>
  )
}

export default App
