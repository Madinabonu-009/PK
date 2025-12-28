import { useMemo } from 'react'
import PropTypes from 'prop-types'
import { Link, useLocation } from 'react-router-dom'
import './Breadcrumb.css'

const ROUTE_LABELS = {
  admin: 'Boshqaruv',
  dashboard: 'Dashboard',
  children: 'Bolalar',
  attendance: 'Davomat',
  payments: 'To\'lovlar',
  groups: 'Guruhlar',
  menu: 'Menyu',
  calendar: 'Kalendar',
  gallery: 'Galereya',
  messages: 'Xabarlar',
  reports: 'Hisobotlar',
  users: 'Foydalanuvchilar',
  settings: 'Sozlamalar',
  profile: 'Profil',
  new: 'Yangi',
  edit: 'Tahrirlash'
}

export default function Breadcrumb({ 
  items,
  separator = '/',
  maxItems = 4,
  homeIcon = '🏠'
}) {
  const location = useLocation()

  const breadcrumbs = useMemo(() => {
    if (items) return items

    // Auto-generate from URL
    const pathnames = location.pathname.split('/').filter(x => x)
    
    return pathnames.map((segment, index) => {
      const path = `/${pathnames.slice(0, index + 1).join('/')}`
      const label = ROUTE_LABELS[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
      
      return {
        label,
        path,
        isLast: index === pathnames.length - 1
      }
    })
  }, [items, location.pathname])

  const displayedBreadcrumbs = useMemo(() => {
    if (breadcrumbs.length <= maxItems) return breadcrumbs

    // Show first, ellipsis, and last items
    const first = breadcrumbs[0]
    const last = breadcrumbs.slice(-2)
    
    return [
      first,
      { label: '...', path: null, isEllipsis: true },
      ...last
    ]
  }, [breadcrumbs, maxItems])

  if (breadcrumbs.length === 0) return null

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <ol className="breadcrumb__list">
        <li className="breadcrumb__item">
          <Link to="/admin" className="breadcrumb__link breadcrumb__link--home">
            {homeIcon}
          </Link>
        </li>

        {displayedBreadcrumbs.map((item, index) => (
          <li key={index} className="breadcrumb__item">
            <span className="breadcrumb__separator">{separator}</span>
            
            {item.isEllipsis ? (
              <span className="breadcrumb__ellipsis">{item.label}</span>
            ) : item.isLast ? (
              <span className="breadcrumb__current" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link to={item.path} className="breadcrumb__link">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    path: PropTypes.string,
    isLast: PropTypes.bool
  })),
  separator: PropTypes.string,
  maxItems: PropTypes.number,
  homeIcon: PropTypes.node
}
