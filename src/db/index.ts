import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url && process.env.NODE_ENV !== "production") {
    throw new Error("DATABASE_URL is required for database operations");
  }
  return url;
};

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function getPool(): Pool {
  const url = databaseUrl();
  if (!url) {
    // Build-time safety: return a stub if no URL (will fail at runtime)
    throw new Error("DATABASE_URL is not set");
  }
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = new Pool({
      connectionString: url,
    });
  }
  return globalForDb.__arenaNextJsPostgresqlPool;
}

function getDb() {
  return drizzle(getPool());
}

export { getPool, getDb };
export const pool = new Proxy(
  {},
  {
    get(_target, prop) {
      const p = getPool();
      return Reflect.get(p, prop, p);
    },
  }
) as Pool;

export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      const d = getDb();
      return Reflect.get(d, prop, d);
    },
  }
) as ReturnType<typeof drizzle>;
