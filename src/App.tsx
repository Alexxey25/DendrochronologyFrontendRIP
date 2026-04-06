import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ROUTES } from './Routes'
import { HomePage } from './pages/HomePage/HomePage'
import ConstructionsPage from './pages/ConstructionsPage/ConstructionsPage'
import ConstructionPage from './pages/ConstructionPage/ConstructionPage'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.CONSTRUCTIONS} element={<ConstructionsPage />} />
        <Route path={ROUTES.CONSTRUCTION} element={<ConstructionPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
