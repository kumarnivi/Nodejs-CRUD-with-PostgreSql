import { Request, Response } from "express";
import * as locationService from "../services/locationService";

export const getAllLocations = async (req: Request, res: Response) => {
  try {
    const locations = await locationService.getLocations();
    res.status(200).json(locations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const addLocation = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Location name is required" });

    const location = await locationService.createLocation(name);
    res.status(201).json(location);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
