import * as path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs";
import { Migrator, FileMigrationProvider, sql } from "kysely";
import { db } from "./database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrator = new Migrator({
  db,
  provider: new FileMigrationProvider({
    fs,
    path,
    migrationFolder: path.join(__dirname, "migrations"),
  }),
});

// Run all pending migrations
async function migrateUp() {
  const { error, results } = await migrator.migrateToLatest();

  results?.forEach((it) => {
    if (it.status === "Success")
      console.log(`Migration "${it.migrationName}" was executed successfully`);
    else if (it.status === "Error")
      console.error(`Failed to execute migration "${it.migrationName}"`);
  });

  if (error) {
    console.error("Failed to migrate up");
    console.error(error);
    process.exit(1);
  }

  if (!results?.length) {
    console.log("No pending migrations");
  }
}

// Rollback the last executed migration
async function migrateDown() {
  const { error, results } = await migrator.migrateDown();

  results?.forEach((it) => {
    if (it.status === "Success")
      console.log(
        `Migration "${it.migrationName}" was rolled back successfully`,
      );
    else if (it.status === "Error")
      console.error(`Failed to roll back migration "${it.migrationName}"`);
  });

  if (error) {
    console.error("Failed to migrate down");
    console.error(error);
    process.exit(1);
  }

  if (!results?.length) {
    console.log("No migrations to roll back");
  }
}

// Drop all tables (old and new names) and re-run all migrations from scratch
async function migrateFresh() {
  console.log("Dropping all tables...");

  // Disable FK checks so we can drop in any order
  await sql`SET FOREIGN_KEY_CHECKS = 0`.execute(db);

  // Drop both old and new table names (safe with IF EXISTS)
  const tablesToDrop = [
    "transaction_items",
    "transactions",
    "item",
    "items",
    "category",
    "categories",
    "kysely_migration",
    "kysely_migration_lock",
  ];

  for (const table of tablesToDrop) {
    await sql`DROP TABLE IF EXISTS ${sql.table(table)}`.execute(db);
  }

  await sql`SET FOREIGN_KEY_CHECKS = 1`.execute(db);

  console.log("All tables dropped. Running migrations...");
  await migrateUp();
}

async function main() {
  const command = process.argv[2] ?? "up";

  switch (command) {
    case "up":
      await migrateUp();
      break;
    case "down":
      await migrateDown();
      break;
    case "fresh":
      await migrateFresh();
      break;
    default:
      console.error(`Unknown command: "${command}"`);
      console.error("Usage: migrate [up|down|fresh]");
      process.exit(1);
  }

  await db.destroy();
}

main();
