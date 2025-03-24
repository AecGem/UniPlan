import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './Registrar.module.css'
import App from './RegistrarApp.jsx'
import ReactDOM from 'react-dom/client'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
