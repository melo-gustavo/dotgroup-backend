import 'dotenv/config';

export const usernameDb = process.env.POSTGRES_USER;
export const passwordDb = process.env.POSTGRES_PASSWORD;
export const hostDb = process.env.POSTGRES_HOST;
export const portDb = process.env.POSTGRES_PORT
  ? parseInt(process.env.POSTGRES_PORT, 10)
  : 5432;
export const database = process.env.POSTGRES_DB;

export const uploadMaxFileSizeBytes = process.env.UPLOAD_MAX_FILE_SIZE_BYTES
  ? parseInt(process.env.UPLOAD_MAX_FILE_SIZE_BYTES, 10)
  : 5 * 1024 * 1024;

export const minioBucket = process.env.MINIO_BUCKET ?? '';
export const minioEndpoint = process.env.MINIO_ENDPOINT ?? '';
export const minioPort = process.env.MINIO_PORT
  ? parseInt(process.env.MINIO_PORT, 10)
  : 9000;
export const minioUseSSL = (process.env.MINIO_USE_SSL ?? 'false') === 'true';
export const minioAccessKey = process.env.MINIO_ACCESS_KEY ?? '';
export const minioSecretKey = process.env.MINIO_SECRET_KEY ?? '';
export const minioRegion = process.env.MINIO_REGION ?? '';
export const minioUrlExpirySeconds = process.env.MINIO_URL_EXPIRY_SECONDS
  ? parseInt(process.env.MINIO_URL_EXPIRY_SECONDS, 10)
  : 60 * 60;
