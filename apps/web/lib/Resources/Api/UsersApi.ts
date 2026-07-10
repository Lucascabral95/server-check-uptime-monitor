import axiosInstance from "@/infraestructure/Api/Axios-config";
import { isAxiosError } from "axios";
import { GetAllUsersDto } from "@/infraestructure/interfaces";

// Solo ADMIN (apps/backend-uptime/src/user/user.controller.ts). Devuelve
// { data, pagination }, no un array crudo.
export async function getUsers(params?: { page?: number; limit?: number }): Promise<GetAllUsersDto> {
    try {
        const { data } = await axiosInstance.get("/user", { params });

        return data;
    } catch (error) {
        if (isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const message = error.response?.data?.message ||
         error.message || "Error al obtener los usuarios";
         throw { status, message };
        }
        throw error;
    }
}

export async function getUserById(id: string) {
    try {
        const { data } = await axiosInstance.get(`/user/${id}`);
        
        return data;
    } catch (error) {
         if (isAxiosError(error)) {
            const status = error.response?.status ?? null;
            const message = error.response?.data?.message || 
                 error.message || "Error al obtener el usuario";
                 throw { status, message };
         }
    }
}

export async function updateUserById(id: string, userData: { email?: string }) {
    try {
        const { data } = await axiosInstance.patch(`/user/${id}`, userData);

        return data;
    } catch (error) {
        if (isAxiosError(error)) {
            const status = error.response?.status ?? null;
            const message = error.response?.data?.message ||
                 error.message || "Error al actualizar el usuario";
                 throw { status, message };
        }
    }
}

export async function deleteUserById(id: string) {
    try {
        const { data } = await axiosInstance.delete(`/user/${id}`);
        
        return data;
    } catch (error) {
        if (isAxiosError(error)) {
            const status = error.response?.status ?? null;
            const message = error.response?.data?.message || 
                 error.message || "Error al eliminar el usuario";
                 throw { status, message };
        }
    }
}
