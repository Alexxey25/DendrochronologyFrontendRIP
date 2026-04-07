import { Link, NavLink } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import yurdisLogo from '../../assets/yurdis-logo.svg'
import yurdisLogoText from '../../assets/yurdis-logo-text.svg'
import './HeaderApp.css'

export default function HeaderApp() {
  return (
    <div className="header-bar_app">
      <div className="header-app-inner">
        <Link to={ROUTES.CONSTRUCTIONS} className="prototype-link">
          <img src={yurdisLogo} className="YURDIS_logo_app" alt="logo" />
          <img src={yurdisLogoText} className="YURDIS_logo_text" alt="ЮРДИС" />
        </Link>
        <nav className="header-nav">
          <NavLink
            to={ROUTES.CONSTRUCTIONS}
            className={({ isActive }) =>
              'header-nav-link' + (isActive ? ' header-nav-link--active' : '')
            }
          >
            {ROUTE_LABELS.CONSTRUCTIONS}
          </NavLink>
        </nav>
      </div>
    </div>
  )
}
