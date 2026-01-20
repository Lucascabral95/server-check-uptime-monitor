"use client"

import { useRouter } from 'next/navigation'

import { useAuth } from '@/lib/hooks/useAuth'

import "./dashboard-home.scss"

const DashboardHome = () => {
  const router = useRouter()
  const { logout, isLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h1>Dashboard Home</h1>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="logout-button"
        >
          {isLoading ? 'Cerrando sesión...' : 'Cerrar sesión'}
        </button>
      </div>
    </div>
  )
}

export default DashboardHome
