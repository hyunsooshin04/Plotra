import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema/index.js";

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://plotra:plotra@localhost:5432/plotra";

export const pool = new pg.Pool({
  connectionString: databaseUrl,
});

export const db = drizzle(pool, { schema });
