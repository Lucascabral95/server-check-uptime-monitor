import axiosInstance from "@/infraestructure/Api/Axios-config";
import { PingLogPaginationParams } from "@/infraestructure/interfaces";
import { isAxiosError } from "axios";

export async function getAllPingLogs() {
    try {
         const { data } = await axiosInstance.get("/ping-log");

         console.log(data);

         return data;
    } catch (error) {
        if (isAxiosError(error)) {
            const status = error.response?.status ?? null;
            const message = error.response?.data?.message ||
                 error.message || "Error al obtener los ping logs";
                 throw { status, message };
        }
        throw error;
    }
}

export async function getPingLogById(id: string) {
    try {
         const { data } = await axiosInstance.get(`/ping-log/id/${id}`);

         console.log(data);

         return data;
    } catch (error) {
         if (isAxiosError(error)) {
            const status = error.response?.status ?? null;
            const message = error.response?.data?.message ||
                 error.message || "Error al obtener el ping log";
                 throw { status, message };
         }
         throw error;
    }
}

// Obtener ping logs de monitors creados por un usuario
export async function findAllPingLogsById(params?: PingLogPaginationParams) {
        try {
             const { data } = await axiosInstance.get(`/ping-log/user/my-logs`, {
                params: params
            });

            console.log(data);

            return data;
        } catch (error) {
        if (isAxiosError(error)) {
           const status = error.response?.status ?? null;
           const message = error.response?.data?.message ||
                error.message || "Error al obtener los ping logs del usuario";
                throw { status, message };
        }
        throw error;
    }
}

export async function deletePingLogById(id: string) {
    try {
        const { data } = await axiosInstance.delete(`/ping-log/${id}`);

        console.log(data);

        return data;
    } catch (error) {
        if (isAxiosError(error)) {
            const status = error.response?.status ?? null;
            const message = error.response?.data?.message ||
                 error.message || "Error al eliminar el ping log";
                 throw { status, message };
        }
        throw error;
    }
}