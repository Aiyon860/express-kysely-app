import "dotenv/config";

export const config = {
  db: {
    host: process.env["DB_HOST"] ?? "localhost",
    port: Number(process.env["DB_PORT"] ?? 3306),
    user: process.env["DB_USER"] ?? "root",
    password: process.env["DB_PASSWORD"] ?? "",
    name: process.env["DB_NAME"] ?? "express_kysely_app",
    connectionLimit: Number(process.env["DB_CONNECTION_LIMIT"] ?? 10),
  },
  app: {
    port: Number(process.env["APP_PORT"] ?? 3000),
  },
} as const;
