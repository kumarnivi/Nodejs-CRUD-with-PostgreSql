import express from 'express';
import { getAllCars, creatCars, editCars, deleteCar ,getSingleCars} from '../controllers/controller';
import upload from '../middleware/multer';



const router = express.Router();

router.get('/users', getAllCars);

router.get('/user/:id', getSingleCars)

router.post('/add', upload.single('image'), creatCars); // Ensure 'image' matches the field name in your form

router.put('/edit/:id' , upload.single('image'),editCars);  
 
router.delete('/delete/:id', deleteCar )

export default router;

