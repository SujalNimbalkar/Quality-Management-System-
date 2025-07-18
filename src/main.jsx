import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { SkillsProvider } from './contexts/SkillsContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SkillsProvider>
      <App />
    </SkillsProvider>
  </StrictMode>,
)
