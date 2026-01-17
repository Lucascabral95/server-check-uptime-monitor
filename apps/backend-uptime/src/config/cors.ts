import { envs } from "./envs.schema";

const MY_URL_FRONTEND = envs.my_url_frontend;

const corsOptions = {
    origin: [
        MY_URL_FRONTEND,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:4000',
        'http://localhost:4200',
        'http://localhost:5173',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
}

export default corsOptions;