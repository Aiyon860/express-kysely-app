import request from "supertest";
import { app } from "../src/server.js";
import { db } from "../src/database.js";

describe("Inventory & Transaction Integration Test", () => {
  let categoryId: number;
  let itemId: number;

  // Reset all related tables before running tests
  // WARNING: Use a dedicated testing database so production data is not lost
  beforeAll(async () => {
    await db.deleteFrom("transaction_items").execute();
    await db.deleteFrom("transactions").execute();
    await db.deleteFrom("items").execute();
    await db.deleteFrom("categories").execute();
  });

  afterAll(async () => {
    await db.destroy();
  });

  it("1. Should be able to create a new category", async () => {
    const res = await request(app)
      .post("/categories")
      .send({ nama: "Alat Kantor" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    categoryId = res.body.id;
  });

  it("2. Should be able to create a new item", async () => {
    const res = await request(app).post("/items").send({
      nama: "Kertas A4",
      category_id: categoryId,
      stock: 10,
    });

    expect(res.status).toBe(201);
    itemId = res.body.id;
  });

  it("3. Should successfully add stock (Stock In)", async () => {
    const res = await request(app)
      .post("/transactions")
      .send({
        type: "in",
        items: [{ item_id: itemId, qty: 5 }],
      });

    expect(res.status).toBe(200);

    // Verify directly in DB using Kysely
    const item = await db
      .selectFrom("items")
      .select("stock")
      .where("id", "=", itemId)
      .executeTakeFirst();

    expect(item?.stock).toBe(15);
  });

  it("4. Should fail if outgoing stock exceeds available stock (Rollback Check)", async () => {
    const res = await request(app)
      .post("/transactions")
      .send({
        type: "out",
        items: [{ item_id: itemId, qty: 100 }], // Exceeds stock of 15
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain("not enough");

    // Ensure stock is NOT changed (Rollback works)
    const item = await db
      .selectFrom("items")
      .select("stock")
      .where("id", "=", itemId)
      .executeTakeFirst();

    expect(item?.stock).toBe(15);
  });
});
