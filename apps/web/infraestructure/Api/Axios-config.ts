import axios from "axios";

// Mismo origen que la app de Next: el browser adjunta la cookie httpOnly del
// idToken automáticamente (no hay Authorization que setear a mano acá). El
// route handler /api/backend/[...path] reenvía esa cookie como
// Authorization: Bearer al backend real.
const axiosInstance = axios.create({
    baseURL: "/api/backend",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

export default axiosInstance;
