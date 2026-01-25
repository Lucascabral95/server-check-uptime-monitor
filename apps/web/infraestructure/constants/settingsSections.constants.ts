import { FiBell, FiMail, FiMoon, FiShield, FiUser } from "react-icons/fi"
import type { ComponentType } from "react"
import type { SVGProps } from "react"

export type IconType = ComponentType<SVGProps<SVGSVGElement>>

export interface SettingsItem {
  label: string
  value: string
  description?: string
  icon: IconType
}

export interface SettingsSection {
  id: string
  title: string
  icon: IconType
  items: SettingsItem[]
}

export const getSettingsSections = (email: string): SettingsSection[] => [
  {
    id: "profile",
    title: "Información de perfil",
    icon: FiUser,
    items: [
      {
        label: "Usuario",
        value: email || "No disponible",
        icon: FiUser,
      },
      {
        label: "Email",
        value: email || "No disponible",
        icon: FiMail,
      },
    ],
  },
  {
    id: "notifications",
    title: "Notificaciones",
    icon: FiBell,
    items: [
      {
        label: "Alertas de estado",
        value: "Activadas",
        description: "Recibe notificaciones cuando un servidor cambie de estado",
        icon: FiBell,
      },
      {
        label: "Reporte diario",
        value: "Proximamente",
        description: "Recibe un resumen diario del estado de tus servidores",
        icon: FiMail,
      },
    ],
  },
  {
    id: "appearance",
    title: "Apariencia",
    icon: FiMoon,
    items: [
      {
        label: "Tema",
        value: "Oscuro",
        description: "Tema actual de la aplicación",
        icon: FiMoon,
      },
    ],
  },
  {
    id: "security",
    title: "Seguridad",
    icon: FiShield,
    items: [
      {
        label: "Autenticación",
        value: "AWS Amplify",
        description: "Sistema de autenticación seguro",
        icon: FiShield,
      },
    ],
  },
]