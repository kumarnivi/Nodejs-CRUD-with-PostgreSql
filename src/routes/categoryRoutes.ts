import express from 'express';
import { addCategory, getAllCategory } from '../controllers/categoryController';

const categoryRoutes = express.Router();
categoryRoutes.post('/categories', addCategory); // Create Category
categoryRoutes.get('/getCategory', getAllCategory)

export default categoryRoutes;
