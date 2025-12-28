import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Loading } from '../common'

// Teacher ruxsat berilgan sahifalar
const TEACHER_ALLOWED_ROUTES = [
  '/admin/dashboard',
  '/admin/attendance',
  '/admin/daily-reports',
  '/admin/children'
]

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="protected-route-loading">
        <Loading />
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  // Teacher uchun cheklangan sahifalar
  if (user?.role === 'teacher') {
    const currentPath = location.pathname
    // Teacher faqat ruxsat berilgan sahifalarga kira oladi
    const isAllowed = TEACHER_ALLOWED_ROUTES.some(route => 
      currentPath === route || currentPath.startsWith(route + '/')
    )
    
    if (!isAllowed) {
      return <Navigate to="/admin/dashboard" replace />
    }
  }

  return children
}

export default ProtectedRoute
