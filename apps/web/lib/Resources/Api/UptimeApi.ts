import axiosInstance from "@/infraestructure/Api/Axios-config";
import { isAxiosError } from "axios";
import { CreateUptimeDto, UpdateUptimeDto, PaginationParams } from "@/infraestructure/interfaces";

export async function createUptime(createUptime: CreateUptimeDto) {
    try {
        const { data } = await axiosInstance.post("/uptime", createUptime);

        console.log(data);

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

        console.log(data);

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

        console.log(data);

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

             console.log(data);

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

// Obtener estadisticas de los enlaces de mis links 
export async function getMyStatsUser() {
    try {
        const { data } = await axiosInstance.get("/uptime/stats/user");

        console.log(data);

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

// Forzar flush del buffer de logs y obtener estadísticas internas del sistema
export async function forceFlushUptime() {
        try {
            const { data } = await axiosInstance.get("/uptime/flush");

            console.log(data);

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

            console.log(data);

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

