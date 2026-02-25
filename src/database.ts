import type { Database } from "./types.js";
import { createPool } from "mysql2";
import { Kysely, MysqlDialect } from "kysely";
import { config } from "./config.js";

// Create MySQL connection pool and Kysely database instance
const dialect = new MysqlDialect({
  pool: createPool({
    database: config.db.name,
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    connectionLimit: config.db.connectionLimit,
  }),
});

export const db = new Kysely<Database>({
  dialect,
  log: ["query", "error"],
});
