import 'dotenv/config';

// Providers repository

export const provideUser = 'USER_REPOSITORY';

export const usernameDb = process.env.POSTGRES_USER;
export const passwordDb = process.env.POSTGRES_PASSWORD;
export const hostDb = process.env.POSTGRES_HOST;
export const portDb = process.env.POSTGRES_PORT
  ? parseInt(process.env.POSTGRES_PORT, 10)
  : undefined;
export const database = process.env.POSTGRES_DB;
