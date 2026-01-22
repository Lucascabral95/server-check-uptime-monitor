import { AuthTokens, useAuthStore } from "@/lib/store/authStore";
import axios from "axios";

const API_URL_BACKEND = process.env.NEXT_PUBLIC_API_URL_BACKEND;

const axiosInstance = axios.create({
    baseURL: API_URL_BACKEND,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

axiosInstance.interceptors.request.use(
    (config) => {
      const { tokens } = useAuthStore.getState();

      if (tokens as AuthTokens) {
        config.headers.Authorization = `Bearer ${(tokens as AuthTokens).idToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
)

export default axiosInstance;