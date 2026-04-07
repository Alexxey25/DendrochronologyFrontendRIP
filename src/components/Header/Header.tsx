import { Link, NavLink } from 'react-router-dom'
import type { FormEvent } from 'react'
import { ROUTES, ROUTE_LABELS } from '../../Routes'
import yurdisLogo from '../../assets/yurdis-logo.svg'
import yurdisLogoText from '../../assets/yurdis-logo-text.svg'
import './Header.css'

interface HeaderProps {
  searchQuery?: string
  onQueryChange?: (v: string) => void
  onSearch?: () => void
}

export default function Header({ searchQuery, onQueryChange, onSearch }: HeaderProps) {
  const showSearch = onSearch !== undefined

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSearch?.()
  }

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
        <form onSubmit={handleSubmit} className="search-form">
          <input
            className="search-input"
            type="text"
            placeholder="Найти конструкцию"
            value={searchQuery ?? ''}
            onChange={(e) => onQueryChange?.(e.target.value)}
          />
          <button className="search-btn" type="submit" aria-label="search">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>
      )}
    </div>
  )
}
