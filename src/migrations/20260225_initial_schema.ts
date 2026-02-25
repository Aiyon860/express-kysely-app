import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // 1. Categories
  await db.schema
    .createTable("categories")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("nama", "varchar(255)", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
    )
    .execute();

  // 2. Items
  await db.schema
    .createTable("items")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("nama", "varchar(255)", (col) => col.notNull())
    .addColumn("category_id", "integer", (col) =>
      col.references("categories.id").onDelete("cascade"),
    )
    .addColumn("stock", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .addColumn("updated_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
    )
    .execute();

  // 3. Transactions
  await db.schema
    .createTable("transactions")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("type", "varchar(10)", (col) => col.notNull()) // "in" or "out"
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();

  // 4. Transaction Items (pivot table)
  await db.schema
    .createTable("transaction_items")
    .addColumn("id", "integer", (col) => col.primaryKey().autoIncrement())
    .addColumn("transaction_id", "integer", (col) =>
      col.references("transactions.id").onDelete("cascade"),
    )
    .addColumn("item_id", "integer", (col) =>
      col.references("items.id").onDelete("cascade"),
    )
    .addColumn("stock_before", "integer", (col) => col.notNull())
    .addColumn("stock_after", "integer", (col) => col.notNull())
    .addColumn("created_at", "timestamp", (col) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`),
    )
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("transaction_items").execute();
  await db.schema.dropTable("transactions").execute();
  await db.schema.dropTable("items").execute();
  await db.schema.dropTable("categories").execute();
}
