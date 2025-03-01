import { Request, Response } from 'express';
import { createVehicle, getAllVechiles } from '../models/vehicleModel';
import pool from '../repository/db'

export const addVehicle = async (req: any, res: any) => {
    try {
        const { category_id, name, number_plate_no, condition_vehicle, location, rent_per_day } = req.body;

        if (!category_id || !name || !number_plate_no || !condition_vehicle || !location || !rent_per_day) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const imagePath = req.file ? req.file.path : null;
        const vehicle = await createVehicle(req.body, imagePath);
        res.status(201).json(vehicle);
    } catch (err:any) {
        res.status(500).json({ error: err.message });
    }
};

export const getVehiclesByLocationAndCategory = async (req: any, res: any) => {
    try {
        const { location, category_id } = req.query;

        // Validate query parameters
        if (!location || !category_id) {
            return res.status(400).json({ error: "Location and Category are required!" });
        }

        // Fetch vehicles with case-insensitive location search
        const vehicles = await pool.query(
            `SELECT * FROM vehicles WHERE location ILIKE $1 AND category_id = $2`,
            [`%${location}%`, category_id] // Allows partial matching too
        );

        // Check if any vehicles were found
        if (vehicles.rows.length === 0) {
            return res.status(404).json({ message: "No vehicles found for the given location and category." });
        }

        res.status(200).json(vehicles.rows);
    } catch (error: any) {
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};


export const getVechiles = async (req:any, res:any) => {
 try {
    const vechiles = await getAllVechiles()
    return res.status(201).json({message:"fech successfully", vechiles})

 }catch (error:any) {
    res.status(500).join({message:"error", error:error.message})
 }
}