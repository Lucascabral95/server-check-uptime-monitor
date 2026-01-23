import axiosInstance from "@/infraestructure/Api/Axios-config";
import { isAxiosError } from "axios";

export async function getUsers() {
    try {
        const { data } = await axiosInstance.get("/user");
        
        console.log(data);

        return data;
    } catch (error) {
        if (isAxiosError(error)) {
    const status = error.response?.status ?? null;
    const message = error.response?.data?.message || 
         error.message || "Error al obtener los usuarios";
         throw { status, message };
        }
    }
}

export async function getUserById(id: string) {
    try {
        const { data } = await axiosInstance.get(`/user/${id}`);
        
        console.log(data);

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

        console.log(data);

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
        
        console.log(data);

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