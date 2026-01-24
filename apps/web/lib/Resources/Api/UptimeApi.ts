import axiosInstance from "@/infraestructure/Api/Axios-config";
import { isAxiosError } from "axios";
import { CreateUptimeDto, UpdateUptimeDto, PaginationParams } from "@/infraestructure/interfaces";

export async function createUptime(createUptime: CreateUptimeDto) {
    try {
        const { data } = await axiosInstance.post("/uptime", createUptime);

        return data;
    } catch (error) {
         if (isAxiosError(error)) {
            const status = error.response?.status ?? null;
            const message = error.response?.data?.message ||
                 error.message || "Error al crear el monitor";
                 throw { status, message };
         }
         throw error;
    }
}

export async function getAllUptimes(params?: PaginationParams) {
    try {
        const { data } = await axiosInstance.get("/uptime", { params });

        return data;
    } catch (error) {
        if (isAxiosError(error)) {
             const status = error.response?.status ?? null;
             const message = error.response?.data?.message ||
                  error.message || "Error al obtener los monitores";
                  throw { status, message };
        }
        throw error;
    }
}

export async function getUptimeById(id: string) {
    try {
        const { data } = await axiosInstance.get(`/uptime/${id}`);

        return data;
    } catch (error) {
         if (isAxiosError(error)) {
             const status = error.response?.status ?? null;
             const message = error.response?.data?.message ||
                  error.message || "Error al obtener el monitor";
                  throw { status, message };
         }
         throw error;
    }
}
    
export async function updateUptimeById(id: string, updateUptimeDto: UpdateUptimeDto) {
        try {
             const { data } = await axiosInstance.patch(`/uptime/${id}`, updateUptimeDto);

             return data;
        } catch (error) {
        if (isAxiosError(error)) {
            const status = error.response?.status ?? null;
            const message = error.response?.data?.message ||
                 error.message || "Error al actualizar el monitor";
                 throw { status, message };
        }
        throw error;
    }
}

export async function deleteUptimeById(id: string) {
    try {
        const { data } = await axiosInstance.delete(`/uptime/${id}`);

        console.log(data);

        return data;
    } catch (error) {
        if (isAxiosError(error)) {
            const status = error.response?.status ?? null;
            const message = error.response?.data?.message ||
                 error.message || "Error al eliminar el monitor";
                 throw { status, message };
        }
        throw error;
    }
}

// Obtener estadisticas avanzadas de logs por UptimeId 
export async function getStatsLogsByUptimeId(uptimeId: string) {
    try {
        const { data } = await axiosInstance.get(`/uptime/logs/${uptimeId}`);

        console.log(data);

        return data;
    } catch (error) {
        if (isAxiosError(error)) {
                const status = error.response?.status ?? null;
                const message = error.response?.data?.message ||
                     error.message || "Error al obtener estadísticas avanzadas de logs por UptimeId";
                     throw { status, message };
            }
            throw error;
    }
}

// Obtener estadisticas de los enlaces de mis links 
export async function getMyStatsUser() {
    try {
        const { data } = await axiosInstance.get("/uptime/stats/user");

        return data;
    } catch (error) {
       if (isAxiosError(error)) {
                const status = error.response?.status ?? null;
                const message = error.response?.data?.message ||
                     error.message || "Error al obtener estadísticas de mis enlaces";
                     throw { status, message };
            }
            throw error;
    }
}

// Obtener detalles de los incidentes de logs de un Monitor (por monitorId)
export async function getIncidents(monitorId: string) {
    try {
        const { data } = await axiosInstance.get(`/uptime/incidents/${monitorId}`);

        console.log(data);

        return data;
    } catch (error) {
        if (isAxiosError(error)) {
                const status = error.response?.status ?? null;
                const message = error.response?.data?.message ||
                     error.message || "Error al obtener incidentes de logs de un Monitor";
                     throw { status, message };
            }
            throw error;
    }
}

export async function getIncidentsByUser(params?: { search?: string; sortBy?: string }) {
    try {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

        const url = `/uptime/incidents/user${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const { data } = await axiosInstance.get(url);

        return data;
    } catch (error) {
        if (isAxiosError(error)) {
                const status = error.response?.status ?? null;
                const message = error.response?.data?.message ||
                     error.message || "Error al obtener incidentes de tus links creados";
                     throw { status, message };
            }
            throw error;
    }
}

// Forzar flush del buffer de logs y obtener estadísticas internas del sistema
export async function forceFlushUptime() {
        try {
            const { data } = await axiosInstance.get("/uptime/flush");

            return data;
        } catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status ?? null;
                const message = error.response?.data?.message ||
                     error.message || "Error al forzar flush del buffer de logs";
                     throw { status, message };
            }
            throw error;
    }
}

export async function getStatsUptime() {
        try {
            const { data } = await axiosInstance.get("/uptime/stats");

            return data;
        } catch (error) {
            if (isAxiosError(error)) {
                const status = error.response?.status ?? null;
                const message = error.response?.data?.message ||
                     error.message || "Error al obtener estadísticas de los monitores";
                     throw { status, message };
            }
            throw error;
    }
}