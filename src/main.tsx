import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadDarkMode, applyDarkClass } from './utils/darkMode.ts'

// Apply dark mode before first render to avoid flash
applyDarkClass(loadDarkMode())

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
