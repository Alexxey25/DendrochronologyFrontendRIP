import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from './Routes'
import ConstructionsPage from './pages/ConstructionsPage/ConstructionsPage'
import ConstructionPage from './pages/ConstructionPage/ConstructionPage'
import SignInPage from './pages/SignInPage/SignInPage'
import SignUpPage from './pages/SignUpPage/SignUpPage'
import DendrochronologyApplicationPage from './pages/DendrochronologyApplicationPage/DendrochronologyApplicationPage'
import DendrochronologyApplicationsPage from './pages/DendrochronologyApplicationsPage/DendrochronologyApplicationsPage'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

function routerBasename(): string | undefined {
  const raw = import.meta.env.BASE_URL ?? '/'
  // Vite при base: './' даёт BASE_URL './' — React Router ждёт basename '' или путь с ведущим '/'; иначе белый экран в Tauri.
  if (raw === '/' || raw === './' || raw === '.') return undefined
  const trimmed = raw.endsWith('/') ? raw.slice(0, -1) : raw
  if (!trimmed.startsWith('/')) return undefined
  return trimmed === '' ? undefined : trimmed
}

function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
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
