import express from 'express';
import { bookVehicle, getBookings } from '../controllers/BookingController';
import { verifyToken, checkRole } from '../middleware/AuthMiddleware';

const bookingRouter = express.Router();

// Book a vehicle (user role)
bookingRouter.post('/', verifyToken, checkRole(["user"]), bookVehicle);

// Get all bookings (admin only)
bookingRouter.get('/all', verifyToken, checkRole(["admin"]), getBookings);

export default bookingRouter;
