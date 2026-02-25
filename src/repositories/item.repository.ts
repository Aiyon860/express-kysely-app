import type { Kysely } from "kysely";
import { db } from "../database.js";
import type { Database, NewItem, ItemUpdate } from "../types.js";

export const itemRepository = {
  async create(data: NewItem) {
    const result = await db
      .insertInto("items")
      .values({
        nama: data.nama,
        category_id: data.category_id,
        stock: data.stock ?? 0,
      })
      .executeTakeFirstOrThrow();

    return Number(result.insertId);
  },

  async findAll() {
    return await db
      .selectFrom("items")
      .innerJoin("categories", "categories.id", "items.category_id")
      .select([
        "items.id",
        "items.nama",
        "categories.nama as category_name",
        "items.stock",
        "items.created_at",
      ])
      .execute();
  },

  async findById(id: number) {
    return await db
      .selectFrom("items")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  },

  async findByIdForUpdate(trx: Kysely<Database>, id: number) {
    return await trx
      .selectFrom("items")
      .select(["id", "stock"])
      .where("id", "=", id)
      .forUpdate()
      .executeTakeFirstOrThrow();
  },

  async updateStock(trx: Kysely<Database>, id: number, data: ItemUpdate) {
    await trx.updateTable("items").set(data).where("id", "=", id).execute();
  },
};
