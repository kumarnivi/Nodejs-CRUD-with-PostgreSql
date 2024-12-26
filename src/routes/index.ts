import express from 'express';
import { getAllCars, creatCars, editCars, deleteCar ,getSingleCars} from '../controllers/controller';



const router = express.Router();

router.get('/users', getAllCars);

router.get('/user/:id', getSingleCars)

router.post('/add', creatCars);

router.put('/edit/:id' , editCars);  
 
router.delete('/delete/:id', deleteCar )

export default router;

