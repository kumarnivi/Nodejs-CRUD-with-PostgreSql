import express from 'express';
import { upload } from '../config/multer';
import { addVehicle, getVechiles, getVehiclesByLocationAndCategory } from '../controllers/vehicleController';

const vechicleRoutes = express.Router();
vechicleRoutes.post('/vehicles', upload.single('image'), addVehicle); // Create Vehicle
vechicleRoutes.get('/', getVechiles )
vechicleRoutes.get('/search', getVehiclesByLocationAndCategory)

export default vechicleRoutes;
