import { Request, Response } from "express";
import * as vehicleService from "../services/vehicleService";

export const getVehicles = async (req: Request, res: Response) => {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.status(200).json(vehicles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addVehicle = async (req: any, res: any) => {
  try {
    // Default to empty string if no file is uploaded
    const imagePath: string = req.file ? `/uploads/${req.file.filename}` : '';

    const vehicle = await vehicleService.createVehicle(req.body, imagePath);

    if (vehicle.error) return res.status(400).json(vehicle);

    res.status(201).json(vehicle);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateVehicle = async (req: any, res: any) => {
  try {
    const vehicleId = parseInt(req.params.id);
    const imagePath = req.body.image || null;
    const updated = await vehicleService.updateVehicle(vehicleId, req.body, imagePath);

    if (updated.error) return res.status(400).json(updated);

    res.status(200).json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
