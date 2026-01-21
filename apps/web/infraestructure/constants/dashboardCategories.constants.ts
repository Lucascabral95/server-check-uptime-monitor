import { HiOutlineStatusOnline } from "react-icons/hi";
import { LuActivity, LuSettings } from "react-icons/lu";
import { MdCheckCircleOutline } from "react-icons/md";

export const DASHBOARD_CATEGORIES = [
    {
        name: "Monitoreo",
        icon: LuActivity,
        path: "/dashboard/home"
    },
    {
        name: "Incidentes",
        icon: MdCheckCircleOutline,
        path: "/dashboard/incidents"
    },
    {
        name: "Estado de servidores",
        icon: HiOutlineStatusOnline,
        path: "/dashboard/servers"
    },
    {
        name: "Configuración",
        icon: LuSettings,
        path: "/dashboard/settings"
    },
]