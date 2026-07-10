import { envs } from "./envs.schema";

const MY_URL_FRONTEND = envs.my_url_frontend;

const isProduction = envs.node_env === 'production';

const localOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:4000',
    'http://localhost:4200',
    'http://localhost:5173',
];

const corsOptions = {
    // En producción solo el frontend configurado; los orígenes localhost
    // solo tienen sentido en desarrollo y no deberían viajar con
    // `credentials: true` a un entorno productivo.
    origin: isProduction ? [MY_URL_FRONTEND] : [MY_URL_FRONTEND, ...localOrigins],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
}

export default corsOptions;