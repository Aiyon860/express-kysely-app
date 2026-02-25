import express, { type Request, type Response } from "express";
import { db } from "./database.js";
import { config } from "./config.js";
import type {
  NewCategory,
  NewItem,
  NewTransaction,
  ItemUpdate,
} from "./types.js";

const app = express();
app.use(express.json());

// --- 1. CREATE CATEGORY ---
app.post("/categories", async (req: Request, res: Response) => {
  try {
    const { nama } = req.body as NewCategory;
    const result = await db
      .insertInto("categories")
      .values({ nama })
      .executeTakeFirstOrThrow();

    res.status(201).json({
      id: Number(result.insertId),
      message: "Category created successfully",
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- 2. CREATE ITEM ---
app.post("/items", async (req: Request, res: Response) => {
  try {
    const { nama, category_id, stock } = req.body as NewItem;

    // Insert the item into the database
    const result = await db
      .insertInto("items")
      .values({
        nama,
        category_id,
        stock: stock ?? 0, // Default stock to 0 if not provided
      })
      .executeTakeFirstOrThrow();

    res.status(201).json({
      id: Number(result.insertId),
      message: "Item added successfully",
    });
  } catch (error: any) {
    // Handle error if category_id is invalid (foreign key constraint)
    res
      .status(400)
      .json({ error: "Failed to add item. Make sure category_id is valid." });
  }
});

// --- 3. GET ALL ITEMS (WITH CATEGORY NAME) ---
app.get("/items", async (req: Request, res: Response) => {
  const items = await db
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
  res.json(items);
});

// --- 4. TRANSACTION (STOCK IN/OUT) ---
app.post("/transactions", async (req: Request, res: Response) => {
  const { type, items } = req.body as {
    type: NewTransaction["type"];
    items: { item_id: number; qty: number }[];
  };

  try {
    const transactionResult = await db.transaction().execute(async (trx) => {
      // Save transaction header
      const header = await trx
        .insertInto("transactions")
        .values({ type })
        .executeTakeFirstOrThrow();

      const transactionId = Number(header.insertId);

      for (const entry of items) {
        // Get current stock and lock the row for update
        const currentItem = await trx
          .selectFrom("items")
          .select(["id", "stock"])
          .where("id", "=", entry.item_id)
          .forUpdate()
          .executeTakeFirstOrThrow();

        const newStock =
          type === "in"
            ? currentItem.stock + entry.qty
            : currentItem.stock - entry.qty;

        if (newStock < 0) {
          throw new Error(`Stock for item "${entry.item_id}" is not enough!`);
        }

        // Update stock
        const updateData: ItemUpdate = {
          stock: newStock,
          updated_at: new Date(),
        };

        await trx
          .updateTable("items")
          .set(updateData)
          .where("id", "=", entry.item_id)
          .execute();

        // Save detail to pivot table
        await trx
          .insertInto("transaction_items")
          .values({
            transaction_id: transactionId,
            item_id: entry.item_id,
            stock_before: currentItem.stock,
            stock_after: newStock,
          })
          .execute();
      }
      return { transactionId };
    });

    res.json({ success: true, data: transactionResult });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Only start listening when this file is run directly (not imported by tests)
const isDirectRun =
  process.argv[1]?.includes("server") || process.argv[1]?.includes("tsx");

if (isDirectRun) {
  app.listen(config.app.port, () => {
    console.log(`Server running on http://localhost:${config.app.port}`);
  });
}

export { app };
