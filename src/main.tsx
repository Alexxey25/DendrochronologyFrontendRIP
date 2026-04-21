import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

//монтирует React приложение в DOM-элемент с id='root'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
