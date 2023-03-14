import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

navigator.serviceWorker.register('/service-worker.js')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
