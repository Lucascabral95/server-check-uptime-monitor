"use client"

import { useAuth } from '@/lib/hooks/useAuth'
import "./DashboardComponents.scss"

const LogoutProfile = () => {
      const { logout, isLoading, user } = useAuth()

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
              <p> {user?.signInDetails?.loginId || "Usuario no disponible"} </p>
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
