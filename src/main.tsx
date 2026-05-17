import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import App from './App'
import { store } from './store'

//монтирует React приложение в DOM-элемент с id='root'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
)

if (!import.meta.env.TAURI_ENV_PLATFORM && 'serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}serviceWorker.js`)
      .then((res) => {
        console.log('service worker registered')
        void res
      })
      .catch((err) => console.log('service worker not registered', err))
  })
}
