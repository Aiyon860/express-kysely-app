import { db } from "../database.js";
import type { NewCategory, Category } from "../types.js";

export const categoryRepository = {
  async create(data: NewCategory): Promise<number> {
    const result = await db
      .insertInto("categories")
      .values({ nama: data.nama })
      .executeTakeFirstOrThrow();

    return Number(result.insertId);
  },

  async findAll(): Promise<Category[]> {
    return await db.selectFrom("categories").selectAll().execute();
  },

  async findById(id: number): Promise<Category | undefined> {
    return await db
      .selectFrom("categories")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  },
};
