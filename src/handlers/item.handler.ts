import type { Request, Response } from "express";
import { itemService } from "../services/item.service.js";
import type { NewItem } from "../types.js";

export const itemHandler = {
  async create(req: Request, res: Response) {
    try {
      const data = req.body as NewItem;
      const result = await itemService.createItem(data);
      res.status(201).json(result);
    } catch (error: any) {
      res
        .status(400)
        .json({ error: "Failed to add item. Make sure category_id is valid." });
    }
  },

  async getAll(_req: Request, res: Response) {
    try {
      const items = await itemService.getAllItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
