import { Request, Response } from "express";
import * as bookingService from "../services/bookingService";

export const getBookings = async (req: any, res: any) => {
  try {
    const bookings = await bookingService.getAllBookings();
    res.status(200).json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const bookVehicle = async (req: any, res: any) => {
  try {
    const userId = parseInt(req.params.userId); // assume passed in route
    const booking = await bookingService.bookVehicle(userId, req.body);

    if (booking.error) return res.status(400).json(booking);

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
