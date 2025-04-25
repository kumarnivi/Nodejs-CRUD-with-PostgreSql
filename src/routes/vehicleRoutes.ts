import express from 'express';
import { upload } from '../config/multer';
import { addLocation, addVehicle, editVehicle, getlocations, getVechiles, getVehiclesByLocationAndCategory } from '../controllers/vehicleController';

const vechicleRoutes = express.Router();
vechicleRoutes.post('/vehicles', upload.single('image'), addVehicle); // Create Vehicle
vechicleRoutes.get('/', getVechiles )
vechicleRoutes.get('/search', getVehiclesByLocationAndCategory)
vechicleRoutes.post('/addlocation', addLocation) //location Added Seperatly
vechicleRoutes.get('/locations', getlocations)
vechicleRoutes.put('/edit/:id', upload.single('image'), editVehicle)
export default vechicleRoutes;
