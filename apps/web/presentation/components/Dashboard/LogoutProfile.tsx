"use client"

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import "./DashboardComponents.scss"

const LogoutProfile = () => {
    const router = useRouter()
      const { logout, isLoading, user } = useAuth()
    
      const handleLogout = async () => {
        await logout()
        router.push('/auth/login')
      }

  return (
    <div className='button-logout-profile-user'>
        <div className='profile-user'>
              <p> {user?.userId} </p>
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
