import { categoryRepository } from "../repositories/category.repository.js";
import type { NewCategory } from "../types.js";

export const categoryService = {
  async createCategory(data: NewCategory) {
    const id = await categoryRepository.create(data);
    return { id, message: "Category created successfully" };
  },

  async getAllCategories() {
    return await categoryRepository.findAll();
  },

  async getCategoryById(id: number) {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new Error(`Category with id ${id} not found`);
    }
    return category;
  },
};
