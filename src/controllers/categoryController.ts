import { Request, Response } from 'express';
import { createCategory, getCategories } from '../models/categoryModel';

export const addCategory = async (req: any, res: any) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }
        const category = await createCategory(name);
        res.status(201).json(category);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllCategory = async (req: any, res: any) => {

    try {
        const category = await getCategories();
        return res.status(201).json(category);
    }
    catch (error: any) {
        res.status(500).join({ message: 'internal server error, ', error: error.message })
    }
}

