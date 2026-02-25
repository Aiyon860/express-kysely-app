import type { Request, Response } from "express";
import { categoryService } from "../services/category.service.js";
import type { NewCategory } from "../types.js";

export const categoryHandler = {
  async create(req: Request, res: Response) {
    try {
      const data = req.body as NewCategory;
      const result = await categoryService.createCategory(data);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAll(_req: Request, res: Response) {
    try {
      const categories = await categoryService.getAllCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params["id"]);
      const category = await categoryService.getCategoryById(id);
      res.json(category);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },
};
