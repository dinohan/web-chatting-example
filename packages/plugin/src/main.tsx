import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

window.parent.navigator.serviceWorker.register('https://19f6e2bc9b77.ngrok.app/service-worker.js')

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
