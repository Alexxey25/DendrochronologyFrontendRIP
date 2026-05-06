import { Link, NavLink } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import yurdisLogo from '../../assets/yurdis-logo.svg'
import yurdisLogoText from '../../assets/yurdis-logo-text.svg'
import { signOut } from '../../modules/authApi'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logoutUser } from '../../store/slices/userSlice'
import './HeaderApp.css'

export default function HeaderApp() {
  const dispatch = useAppDispatch()
  const { isAuthenticated, login } = useAppSelector((state) => state.user)

  const handleLogout = () => {
    void signOut().finally(() => {
      dispatch(logoutUser())
    })
  }

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
          {isAuthenticated ? (
            <>
              <NavLink
                to={ROUTES.DENDROCHRONOLOGIES}
                className={({ isActive }) =>
                  'header-nav-link' + (isActive ? ' header-nav-link--active' : '')
                }
              >
                {ROUTE_LABELS.DENDROCHRONOLOGIES}
              </NavLink>
              <button type="button" className="header-nav-button" onClick={handleLogout}>
                Выход
              </button>
              <span className="header-username">{login}</span>
            </>
          ) : (
            <>
              <NavLink
                to={ROUTES.SIGN_IN}
                className={({ isActive }) =>
                  'header-nav-link' + (isActive ? ' header-nav-link--active' : '')
                }
              >
                {ROUTE_LABELS.SIGN_IN}
              </NavLink>
              <NavLink
                to={ROUTES.SIGN_UP}
                className={({ isActive }) =>
                  'header-nav-link' + (isActive ? ' header-nav-link--active' : '')
                }
              >
                {ROUTE_LABELS.SIGN_UP}
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}
