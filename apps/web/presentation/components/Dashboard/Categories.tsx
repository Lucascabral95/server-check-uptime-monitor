"use client"

import Link from "next/link";

import { DASHBOARD_CATEGORIES } from "@/infraestructure/constants/dashboardCategories.constants";
import "./DashboardComponents.scss"
import { usePathname } from "next/navigation";

const CategoriesDashboard = () => {
   const location = usePathname();

  return (
    <ul className="container-categories-ul">
        {DASHBOARD_CATEGORIES.map((category) => (
            <Link key={category.name} href={category.path}
            className={location === category.path ? "container-categories-li-active" : "container-categories-li"}
            aria-label={category.name}
            >
                <category.icon className="icon-category" />
                <span>{category.name}</span>
            </Link>
        ))}
    </ul>
  )
}

export default CategoriesDashboard;