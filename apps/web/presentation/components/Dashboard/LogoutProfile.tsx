"use client"

import { useAuth } from '@/lib/hooks/useAuth'
import "./DashboardComponents.scss"

const getInitials = (loginId?: string) => {
  if (!loginId) return "?"
  const namePart = loginId.split("@")[0]
  return namePart.slice(0, 2).toUpperCase()
}

const LogoutProfile = () => {
      const { logout, isLoading, user } = useAuth()
      const loginId = user?.signInDetails?.loginId

      const handleLogout = async () => {
        await logout()
        // Hard navigation: evita servir un redirect stale cacheado por el
        // router cliente de Next.js de cuando /auth/login se pudo haber
        // prefetcheado en un estado de auth distinto (ver LoginView.tsx).
        window.location.href = '/auth/login'
      }

  return (
    <div className='button-logout-profile-user'>
        <div className='profile-user'>
              <div className="profile-avatar">{getInitials(loginId)}</div>
              <p> {loginId || "Usuario no disponible"} </p>
        </div>

      <button
          onClick={handleLogout}
          disabled={isLoading}
          className="logout-button"
        >
          {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </button>
    </div>
  )
}

export default LogoutProfile
