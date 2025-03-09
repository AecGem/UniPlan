import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './Registrant.css'
import App from './RegistrantApp.jsx'
import ReactDOM from 'react-dom/client'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
