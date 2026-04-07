import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from './Routes'
import ConstructionsPage from './pages/ConstructionsPage/ConstructionsPage'
import ConstructionPage from './pages/ConstructionPage/ConstructionPage'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.CONSTRUCTIONS} replace />} />
        <Route path={ROUTES.CONSTRUCTIONS} element={<ConstructionsPage />} />
        <Route path={ROUTES.CONSTRUCTION} element={<ConstructionPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
