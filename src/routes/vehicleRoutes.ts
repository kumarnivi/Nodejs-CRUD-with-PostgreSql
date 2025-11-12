import express from 'express';
import { getVehicles, addVehicle, updateVehicle } from '../controllers/vehicleController';
import { verifyToken, checkRole } from '../middleware/AuthMiddleware';
import upload from '../middleware/upload';

const vehicleRouter = express.Router();

// Get all vehicles (any user)
vehicleRouter.get('/', getVehicles);

// Admin routes
vehicleRouter.post('/', verifyToken, checkRole(["admin"]), upload.single("image"), addVehicle);
vehicleRouter.put('/:id', verifyToken, checkRole(["admin"]), upload.single("image"), updateVehicle);
// vehicleRouter.delete('/:id', verifyToken, checkRole(["admin"]), deleteVehicle);

export default vehicleRouter;
