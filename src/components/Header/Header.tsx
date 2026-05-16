import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import yurdisLogo from '../../assets/yurdis-logo.svg'
import yurdisLogoText from '../../assets/yurdis-logo-text.svg'
import InputField from '../InputField/InputField'
import { signOut } from '../../modules/authApi'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { logoutUser } from '../../store/slices/userSlice'
import './Header.css'

interface HeaderProps {
  searchQuery?: string
  onQueryChange?: (v: string) => void
  onSearch?: () => void
  searchLoading?: boolean
  searchPlaceholder?: string
  searchButtonTitle?: string
  /** Сброс каталога и поиска при переходе на главную с хедера */
  onCatalogReset?: () => void
  searchSuggestions?: string[]
}

export default function Header({
  searchQuery,
  onQueryChange,
  onSearch,
  searchLoading,
  searchPlaceholder = 'Найти конструкцию',
  searchButtonTitle,
  onCatalogReset,
  searchSuggestions,
}: HeaderProps) {
  const showSearch = onSearch !== undefined
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dispatch = useAppDispatch()
  const { isAuthenticated, login } = useAppSelector((state) => state.user)

  const handleCatalogNav = () => {
    onCatalogReset?.()
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const handleLogout = () => {
    void signOut().finally(() => {
      dispatch(logoutUser())
    })
    closeMobileMenu()
  }

  return (
    <div className="header-bar">
      <div className="header-logo">
        <Link
          to={ROUTES.CONSTRUCTIONS}
          className="prototype-link"
          onClick={() => {
            handleCatalogNav()
            closeMobileMenu()
          }}
        >
          <img src={yurdisLogo} className="YURDIS_logo" alt="logo" />
          <img src={yurdisLogoText} className="YURDIS_logo_text" alt="logo-text" />
        </Link>
        <nav className="header-nav header-nav--desktop" aria-label="Основная навигация">
          <NavLink
            to={ROUTES.CONSTRUCTIONS}
            className={({ isActive }) =>
              'header-nav-link' + (isActive ? ' header-nav-link--active' : '')
            }
            onClick={handleCatalogNav}
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
        <div
          className={
            'header-nav-mobile' + (mobileMenuOpen ? ' header-nav-mobile--open' : '')
          }
        >
          <button
            type="button"
            className="header-nav-mobile-toggle"
            aria-expanded={mobileMenuOpen}
            aria-controls="header-nav-mobile-panel"
            aria-label={mobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span className="header-nav-mobile-burger" aria-hidden />
          </button>
          <div
            id="header-nav-mobile-panel"
            className="header-nav-mobile-panel"
            hidden={!mobileMenuOpen}
          >
            <NavLink
              to={ROUTES.CONSTRUCTIONS}
              className={({ isActive }) =>
                'header-nav-link' + (isActive ? ' header-nav-link--active' : '')
              }
              onClick={() => {
                handleCatalogNav()
                closeMobileMenu()
              }}
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
                  onClick={closeMobileMenu}
                >
                  {ROUTE_LABELS.DENDROCHRONOLOGIES}
                </NavLink>
                <button type="button" className="header-nav-button" onClick={handleLogout}>
                  Выход
                </button>
                <span className="header-username header-username--mobile">{login}</span>
              </>
            ) : (
              <>
                <NavLink
                  to={ROUTES.SIGN_IN}
                  className={({ isActive }) =>
                    'header-nav-link' + (isActive ? ' header-nav-link--active' : '')
                  }
                  onClick={closeMobileMenu}
                >
                  {ROUTE_LABELS.SIGN_IN}
                </NavLink>
                <NavLink
                  to={ROUTES.SIGN_UP}
                  className={({ isActive }) =>
                    'header-nav-link' + (isActive ? ' header-nav-link--active' : '')
                  }
                  onClick={closeMobileMenu}
                >
                  {ROUTE_LABELS.SIGN_UP}
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="search-form">
          <InputField
            value={searchQuery ?? ''}
            setValue={(v) => onQueryChange?.(v)}
            loading={searchLoading}
            onSubmit={() => onSearch?.()}
            placeholder={searchPlaceholder}
            buttonTitle={searchButtonTitle}
            suggestions={searchSuggestions}
          />
        </div>
      )}
    </div>
  )
}
