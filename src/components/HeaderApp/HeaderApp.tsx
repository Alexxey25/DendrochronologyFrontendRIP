import { Link } from 'react-router-dom'
import { ROUTES } from '../../Routes'
import yurdisLogo from '../../assets/yurdis-logo.svg'
import yurdisLogoText from '../../assets/yurdis-logo-text.svg'
import './HeaderApp.css'

export default function HeaderApp() {
  return (
    <div className="header-bar_app">
      <Link to={ROUTES.HOME} className="prototype-link">
        <img src={yurdisLogo} className="YURDIS_logo_app" alt="logo" />
        <img src={yurdisLogoText} className="YURDIS_logo_text" alt="ЮРДИС" />
      </Link>
    </div>
  )
}
