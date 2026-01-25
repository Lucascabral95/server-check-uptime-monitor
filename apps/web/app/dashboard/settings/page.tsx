"use client"

import { useRouter } from "next/navigation"
import { FiLogOut } from "react-icons/fi"

import { useAuth } from "@/lib/hooks/useAuth"
import { getSettingsSections } from "@/infraestructure/constants/settingsSections.constants"

import "./settings.scss"

const SettingsDashboard = () => {
  const router = useRouter()
  const { logout, isLoading, user } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push("/auth/login")
  }

  const settingsSections = getSettingsSections(user?.signInDetails?.loginId || "") 

  return (
    <div className="settings-dashboard">
      <div className="settings-header">
        <h1>Configuración</h1>
        <p className="settings-subtitle">Gestiona tu cuenta y preferencias</p>
      </div>

      <div className="settings-content">
        {settingsSections.map((section) => (
          <div key={section.id} className="settings-section">
            <div className="settings-section-header">
              <section.icon className="settings-section-icon" />
              <h2>{section.title}</h2>
            </div>
            <div className="settings-section-content">
              {section.items.map((item, index) => (
                <div key={index} className="settings-item">
                  <div className="settings-item-icon">
                    <item.icon />
                  </div>
                  <div className="settings-item-content">
                    <div className="settings-item-header">
                      <span className="settings-item-label">{item.label}</span>
                      <span className="settings-item-value">{item.value}</span>
                    </div>
                    {item.description && (
                      <p className="settings-item-description">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="settings-section settings-logout">
          <div className="settings-section-header settings-logout-header">
            <FiLogOut className="settings-section-icon logout-icon-header" />
            <h2>Cerrar sesión</h2>
          </div>
          <div className="settings-section-content">
            <div className="settings-logout-content">
              <p className="settings-logout-description">
                Al cerrar sesión, terminarás tu sesión actual y serás redirigido a la página de inicio de sesión.
              </p>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="settings-logout-button"
              >
                <FiLogOut className="logout-button-icon" />
                <span>{isLoading ? "Cerrando sesión..." : "Cerrar sesión"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsDashboard
