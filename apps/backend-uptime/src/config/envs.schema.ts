import "dotenv/config";
import * as joi from "joi";
import type { StringValue } from "ms";

interface EnvsSchemaInterface {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  SECRET_JWT: string;
  JWT_EXPIRES_IN: StringValue;
  MY_URL_FRONTEND: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  POSTGRES_DB: string;
  POSTGRES_PORT: number;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;
}

const envsSchema = joi.object<EnvsSchemaInterface>({
  PORT: joi.number().default(4000),
  NODE_ENV: joi.string().default("development"),
  DATABASE_URL: joi.string().required(),
  SECRET_JWT: joi.string().required(),
  JWT_EXPIRES_IN: joi.string().default("60d"),
  MY_URL_FRONTEND: joi.string().required(),
  POSTGRES_USER: joi.string().required(),
  POSTGRES_PASSWORD: joi.string().required(),
  POSTGRES_DB: joi.string().required(),
  POSTGRES_PORT: joi.number().default(5432),
  REDIS_HOST: joi.string().required(),
  REDIS_PORT: joi.number().default(6379),
  REDIS_PASSWORD: joi.string().required(),
}).unknown(true);  

const { error, value: vars } = envsSchema.validate(process.env);

if (error) {
  console.error("ENV ERROR:", error.details);
  throw new Error("Invalid environment variables");
}

export const envs = {
  port: vars.PORT,
  node_env: vars.NODE_ENV,
  database_url: vars.DATABASE_URL,
  secret_jwt: vars.SECRET_JWT,
  jwt_expires_in: vars.JWT_EXPIRES_IN,
  my_url_frontend: vars.MY_URL_FRONTEND,
  postgres_user: vars.POSTGRES_USER,
  postgres_password: vars.POSTGRES_PASSWORD,
  postgres_db: vars.POSTGRES_DB,
  postgres_port: vars.POSTGRES_PORT,
  redis_host: vars.REDIS_HOST,
  redis_port: vars.REDIS_PORT,
  redis_password: vars.REDIS_PASSWORD,
};
