import express from 'express';
import { booking } from '../controllers/BookingController';
import { verifyToken } from '../middleware/AuthMiddleware';

const bookingRouts = express.Router();

bookingRouts.post('/booking', verifyToken,  booking)


export default bookingRouts;

