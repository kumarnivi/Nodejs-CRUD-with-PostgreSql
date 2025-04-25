import express from 'express';
import { booking, getBooking } from '../controllers/BookingController';
import { verifyToken } from '../middleware/AuthMiddleware';

const bookingRouts = express.Router();

bookingRouts.post('/booking', verifyToken,  booking)
bookingRouts.get('/allbooking', getBooking )

export default bookingRouts;

