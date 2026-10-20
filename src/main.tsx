import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { useTrip } from './store'

// Dev-only handle for jumping between states while testing.
if (import.meta.env.DEV) Object.assign(window, { trip: useTrip })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
