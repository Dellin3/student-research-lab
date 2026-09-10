import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { NAVIGATION_ROUTES } from '../../config/routes.js'

export default function Header() {
  const [menu, setMenu] = useState({ open: false, path: '' })
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const open = menu.open && menu.path === location.pathname

  useEffect(() => {
    const target = location.hash ? document.getElementById(location.hash.slice(1)) : null
    if (target) {
      if (target.tagName === 'DETAILS') target.open = true
      target.scrollIntoView({ block: 'start', behavior: 'instant' })
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location.pathname, location.hash])

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 24)
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [])

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="Research Starter Lab home">
          <span className="brand-mark" aria-hidden="true">r<span>↗</span></span>
          <span><strong>Research Starter Lab</strong></span>
        </Link>
        <button
          className="menu-button"
          type="button"
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label={open ? 'Close navigation' : 'Open navigation'}
          onClick={() => setMenu({ open: !open, path: location.pathname })}
        >
          <i /><i /><i />
        </button>
        <nav id="primary-navigation" className={open ? 'primary-nav is-open' : 'primary-nav'} aria-label="Primary navigation" onClick={() => setMenu({ open: false, path: location.pathname })} onKeyDown={event => { if (event.key === 'Escape') setMenu({ open: false, path: location.pathname }) }}>
          {NAVIGATION_ROUTES.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              className={({ isActive }) => isActive ? 'active' : undefined}
            >
              {route.navigationLabel}
            </NavLink>
          ))}
          <NavLink className="nav-notes" to="/worksheet">My notes <span aria-hidden="true">↗</span></NavLink>
        </nav>
      </div>
    </header>
  )
}
