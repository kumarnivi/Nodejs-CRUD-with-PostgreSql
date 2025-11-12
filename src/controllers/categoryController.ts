import { Request, Response } from "express";
import * as categoryService from "../services/categoryService";

export const getAllCategories = async (req: any, res: any) => {
  try {
    const categories = await categoryService.getCategories();
    res.status(200).json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addCategory = async (req: any, res: any) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Category name is required" });

    const category = await categoryService.createCategory(name);
    res.status(201).json(category);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
