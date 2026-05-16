import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { invoke } from '@tauri-apps/api/core'
import { GITHUB_PAGES_REPO_SLUG } from './config/githubPages'
import { ROUTES } from './Routes'
import ConstructionsPage from './pages/ConstructionsPage/ConstructionsPage'
import ConstructionPage from './pages/ConstructionPage/ConstructionPage'
import SignInPage from './pages/SignInPage/SignInPage'
import SignUpPage from './pages/SignUpPage/SignUpPage'
import DendrochronologyApplicationPage from './pages/DendrochronologyApplicationPage/DendrochronologyApplicationPage'
import DendrochronologyApplicationsPage from './pages/DendrochronologyApplicationsPage/DendrochronologyApplicationsPage'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

function App() {
  useEffect(() => {
    invoke('tauri', { cmd: 'create' })
      .then(() => {
        console.log('Tauri launched')
      })
      .catch(() => {
        console.log('Tauri not launched')
      })
    return () => {
      invoke('tauri', { cmd: 'close' })
        .then(() => {
          console.log('Tauri launched')
        })
        .catch(() => {
          console.log('Tauri not launched')
        })
    }
  }, [])

  return (
    <BrowserRouter basename={`/${GITHUB_PAGES_REPO_SLUG}`}>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.CONSTRUCTIONS} replace />} />
        <Route path={ROUTES.CONSTRUCTIONS} element={<ConstructionsPage />} />
        <Route path={ROUTES.CONSTRUCTION} element={<ConstructionPage />} />
        <Route path={ROUTES.SIGN_IN} element={<SignInPage />} />
        <Route path={ROUTES.SIGN_UP} element={<SignUpPage />} />
        <Route path={ROUTES.DENDROCHRONOLOGIES} element={<DendrochronologyApplicationsPage />} />
        <Route path={ROUTES.DENDROCHRONOLOGY} element={<DendrochronologyApplicationPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
