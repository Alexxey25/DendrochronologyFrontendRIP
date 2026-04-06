import './HomePage.css'
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../Routes'
import Header from '../../components/Header/Header'
import { BreadCrumbs } from '../../components/BreadCrumbs/BreadCrumbs'

export const HomePage: FC = () => {
  return (
    <div className="mainpage">
      <Header />
      <BreadCrumbs crumbs={[]} />
      <div className="home-hero">
        <div className="hero-content">
          <h1 className="hero-title">Дата постройки по дендрохронологии с учетом use-life древесины</h1>
          <Link to={ROUTES.CONSTRUCTIONS} className="btn-hero">
            Каталог конструкций
          </Link>
        </div>
      </div>
    </div>
  )
}
