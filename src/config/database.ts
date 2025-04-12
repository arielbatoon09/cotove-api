import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { logger } from '@/config/logger';

if (!process.env.DATABASE_URI) {
  throw new Error('DATABASE_URI is not defined in environment variables');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URI as string,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool);

export const checkDatabaseConnection = async () => {
  try {
    await pool.connect();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Failed to connect to the database:', error);
    return false;
  }
}; 