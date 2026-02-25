import { itemRepository } from "../repositories/item.repository.js";
import type { NewItem } from "../types.js";

export const itemService = {
  async createItem(data: NewItem) {
    const id = await itemRepository.create(data);
    return { id, message: "Item added successfully" };
  },

  async getAllItems() {
    return await itemRepository.findAll();
  },

  async getItemById(id: number) {
    return await itemRepository.findById(id);
  },
};
