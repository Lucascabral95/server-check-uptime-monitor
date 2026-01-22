"use client"

import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { Status, SortBy } from "@/infraestructure/interfaces";

import { FiltersMonitor } from "@/presentation/components/Filters";
import useUptime from "@/presentation/hooks/useUptime.hook";
import CardUptime from "@/presentation/components/Dashboard/Home/CardUptime";
import "./dashboard-home.scss"

const DashboardHome = () => {

  const [filters, setFilters] = useState<{
    search?: string;
    status?: Status | null;
    sortBy?: SortBy | null;
  }>({});

  const { uptimes } = useUptime(undefined, filters);

  const handleFiltersChange = (newFilters: {
    search?: string;
    status?: Status | null;
    sortBy?: SortBy | null;
  }) => {
    setFilters(newFilters);
  };

   useEffect(() => {
      console.log("=== USERS HOOK DATA ===");
      console.log("userById query:", uptimes.data);
   }, [uptimes]);

  return (
    <div className="dashboard-home">
      <div className="title-button">
      <div className="title-home">
       <h2> Monitoreo de servidores </h2>
      </div>
      <div className="button-add-server">
         <button className="add-server">
          <FiPlus className="icon" />
            <span>Nuevo servidor</span>
         </button>
      </div>
      </div>
      <div className="filter-current">
        <FiltersMonitor onFiltersChange={handleFiltersChange} monitorCount={uptimes.data?.pagination?.totalItems} />
      </div>

     <div className="all-uptimes">
      <div className="cards-grid">
        {uptimes.data?.data?.map((uptime, index: number) => (
          <CardUptime key={index} uptimes={uptime} />
        ))}
      </div>
     </div>

    </div>
  )
}

export default DashboardHome
