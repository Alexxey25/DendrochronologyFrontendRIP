import { Link, NavLink } from 'react-router-dom'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import yurdisLogo from '../../assets/yurdis-logo.svg'
import yurdisLogoText from '../../assets/yurdis-logo-text.svg'
import InputField from '../InputField/InputField'
import './Header.css'

interface HeaderProps {
  searchQuery?: string
  onQueryChange?: (v: string) => void
  onSearch?: () => void
  searchLoading?: boolean
  searchPlaceholder?: string
  searchButtonTitle?: string
}

export default function Header({
  searchQuery,
  onQueryChange,
  onSearch,
  searchLoading,
  searchPlaceholder = 'Найти конструкцию',
  searchButtonTitle,
}: HeaderProps) {
  const showSearch = onSearch !== undefined

  return (
    <div className="header-bar">
      <div className="header-logo">
        <Link to={ROUTES.CONSTRUCTIONS} className="prototype-link">
          <img src={yurdisLogo} className="YURDIS_logo" alt="logo" />
          <img src={yurdisLogoText} className="YURDIS_logo_text" alt="logo-text" />
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

      {showSearch && (
        <div className="search-form">
          <InputField
            value={searchQuery ?? ''}
            setValue={(v) => onQueryChange?.(v)}
            loading={searchLoading}
            onSubmit={() => onSearch?.()}
            placeholder={searchPlaceholder}
            buttonTitle={searchButtonTitle}
          />
        </div>
      )}
    </div>
  )
}
