import { Request, Response } from 'express';
import { Allbooking, bookVehicle } from '../models/BookingModel';


export const booking  = async (req:any, res:any) => {
    try {
        const booking = await bookVehicle(req.user.id, req.body);
        res.status(201).json({ message: "Booking successful", booking });
    } catch (error: any) {
        res.status(500).json({ message: "Error booking vehicle", error: error.message });
    }

}

export const  getBooking = async (req:any, res:any) => {
    try {
        const result = await Allbooking();
        return res.status(201).json ({message:"fetch successfully", result});

    } catch (error:any) {
        res.status(500).json({message:"internal server error", err:error.message})
    }
}