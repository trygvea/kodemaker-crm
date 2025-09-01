import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  // Keep a clear error to surface missing configuration early
  console.warn('DATABASE_URL is not set. Database features will not work until it is configured.')
}

export const pool = new Pool({ connectionString: databaseUrl })
export const db = drizzle(pool)


