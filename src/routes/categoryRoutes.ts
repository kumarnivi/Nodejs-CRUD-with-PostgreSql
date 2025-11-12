import express from 'express';
import { addCategory, getAllCategories } from '../controllers/categoryController';

const categoryRoutes = express.Router();
categoryRoutes.post('/categories', addCategory); // Create Category
categoryRoutes.get('/getCategory', getAllCategories);

export default categoryRoutes;
