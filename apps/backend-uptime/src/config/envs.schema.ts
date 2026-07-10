import 'dotenv/config';
import * as joi from 'joi';
import type { StringValue } from 'ms';

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
  AWS_REGION: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_SES_FROM_EMAIL: string;
  GMAIL_APP_USER: string;
  GMAIL_APP_PASSWORD: string;
  SEND_EMAIL_NODEMAILER_SES: string;
  COGNITO_ISSUER: string;
  COGNITO_CLIENT_ID: string;
  DB_POOL_MAX: number;
  DB_POOL_MIN: number;
  DB_POOL_IDLE_TIMEOUT_MS: number;
  DB_POOL_CONNECTION_TIMEOUT_MS: number;
  SHUTDOWN_DRAIN_DELAY_MS: number;
  WORKER_CONCURRENCY: number;
  OUTBOX_POLL_INTERVAL_MS: number;
  OUTBOX_BATCH_SIZE: number;
  OUTBOX_LEASE_DURATION_MS: number;
  OUTBOX_RETRY_BASE_DELAY_MS: number;
  OUTBOX_RETRY_MAX_DELAY_MS: number;
  MONITOR_SECRETS_KEY?: string;
  RAW_LOG_RETENTION_DAYS: number;
}

const envsSchema = joi
  .object<EnvsSchemaInterface>({
    PORT: joi.number().default(4000),
    NODE_ENV: joi.string().default('development'),
    DATABASE_URL: joi.string().required(),
    SECRET_JWT: joi.string().required(),
    JWT_EXPIRES_IN: joi.string().default('60d'),
    MY_URL_FRONTEND: joi.string().required(),
    POSTGRES_USER: joi.string().required(),
    POSTGRES_PASSWORD: joi.string().required(),
    POSTGRES_DB: joi.string().required(),
    POSTGRES_PORT: joi.number().default(5432),
    REDIS_HOST: joi.string().required(),
    REDIS_PORT: joi.number().default(6379),
    REDIS_PASSWORD: joi.string().required(),
    AWS_REGION: joi.string().required(),
    AWS_ACCESS_KEY_ID: joi.string().required(),
    AWS_SECRET_ACCESS_KEY: joi.string().required(),
    AWS_SES_FROM_EMAIL: joi.string().required(),
    GMAIL_APP_USER: joi.string().required(),
    GMAIL_APP_PASSWORD: joi.string().required(),
    SEND_EMAIL_NODEMAILER_SES: joi.string().required(),
    COGNITO_ISSUER: joi.string().uri().required(),
    COGNITO_CLIENT_ID: joi.string().required(),
    DB_POOL_MAX: joi.number().default(10),
    DB_POOL_MIN: joi.number().default(2),
    DB_POOL_IDLE_TIMEOUT_MS: joi.number().default(30000),
    DB_POOL_CONNECTION_TIMEOUT_MS: joi.number().default(5000),
    SHUTDOWN_DRAIN_DELAY_MS: joi.number().default(3000),
    WORKER_CONCURRENCY: joi.number().default(5),
    OUTBOX_POLL_INTERVAL_MS: joi.number().integer().min(100).default(1000),
    OUTBOX_BATCH_SIZE: joi.number().integer().min(1).max(1000).default(100),
    OUTBOX_LEASE_DURATION_MS: joi.number().integer().min(1000).default(30000),
    OUTBOX_RETRY_BASE_DELAY_MS: joi.number().integer().min(100).default(1000),
    OUTBOX_RETRY_MAX_DELAY_MS: joi.number().integer().min(1000).default(60000),
    MONITOR_SECRETS_KEY: joi.string().allow('').optional(),
    RAW_LOG_RETENTION_DAYS: joi.number().integer().min(1).default(30),
  })
  .unknown(true);

const validationResult = envsSchema.validate(process.env);

if (validationResult.error) {
  console.error('ENV ERROR:', validationResult.error.details);
  throw new Error('Invalid environment variables');
}

const vars = validationResult.value as unknown as EnvsSchemaInterface;

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
  aws_region: vars.AWS_REGION,
  aws_access_key_id: vars.AWS_ACCESS_KEY_ID,
  aws_secret_access_key: vars.AWS_SECRET_ACCESS_KEY,
  aws_ses_from_email: vars.AWS_SES_FROM_EMAIL,
  gmail_app_user: vars.GMAIL_APP_USER,
  gmail_app_password: vars.GMAIL_APP_PASSWORD,
  send_email_nodemailer_ses: vars.SEND_EMAIL_NODEMAILER_SES,
  cognito_issuer: vars.COGNITO_ISSUER,
  cognito_client_id: vars.COGNITO_CLIENT_ID,
  db_pool_max: vars.DB_POOL_MAX,
  db_pool_min: vars.DB_POOL_MIN,
  db_pool_idle_timeout_ms: vars.DB_POOL_IDLE_TIMEOUT_MS,
  db_pool_connection_timeout_ms: vars.DB_POOL_CONNECTION_TIMEOUT_MS,
  shutdown_drain_delay_ms: vars.SHUTDOWN_DRAIN_DELAY_MS,
  worker_concurrency: vars.WORKER_CONCURRENCY,
  outbox_poll_interval_ms: vars.OUTBOX_POLL_INTERVAL_MS,
  outbox_batch_size: vars.OUTBOX_BATCH_SIZE,
  outbox_lease_duration_ms: vars.OUTBOX_LEASE_DURATION_MS,
  outbox_retry_base_delay_ms: vars.OUTBOX_RETRY_BASE_DELAY_MS,
  outbox_retry_max_delay_ms: vars.OUTBOX_RETRY_MAX_DELAY_MS,
  monitor_secrets_key: vars.MONITOR_SECRETS_KEY ?? '',
  raw_log_retention_days: vars.RAW_LOG_RETENTION_DAYS,
};
