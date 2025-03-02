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
        const { category_id, location } = req.query;

        // Validate category_id first
        if (!category_id) {
            return res.status(400).json({ error: "Category is required!" });
        }

        if (!location) {
            // Fetch locations for the selected category
            const locations = await pool.query(
                `SELECT DISTINCT location FROM vehicles WHERE category_id = $1`,
                [category_id]
            );
            return res.status(200).json(locations.rows);
        }

        // Fetch vehicles after category and location are selected
        const vehicles = await pool.query(
            `SELECT * FROM vehicles WHERE category_id = $1 AND location ILIKE $2`,
            [category_id, `%${location}%`] // Partial matching for location
        );

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