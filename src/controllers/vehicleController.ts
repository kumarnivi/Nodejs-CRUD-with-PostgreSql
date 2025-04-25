import { Request, Response } from 'express';
import { createVehicle, createLocation, getAllVechiles, getLocations  ,updateVehicle} from '../models/vehicleModel';
import pool from '../repository/db'

export const addVehicle = async (req: any, res: any) => {
    try {
        const { category_id, name, number_plate_no, condition_vehicle, location_id, rent_per_day } = req.body;

        if (!category_id || !name || !number_plate_no || !condition_vehicle || !location_id || !rent_per_day) {
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
        const { category_id, location_id } = req.query;

        // Validate category_id
        if (!category_id) {
            return res.status(400).json({ error: "Category ID is required!" });
        }

        if (!location_id) {
            // Fetch available locations for the selected category
            const locationsQuery = `
                SELECT DISTINCT l.id AS location_id, l.name AS location_name 
                FROM vehicles v
                JOIN location l ON v.location_id = l.id
                WHERE v.category_id = $1
            `;
            const locations = await pool.query(locationsQuery, [category_id]);

            return res.status(200).json({ locations: locations.rows });
        }

        // Check if location_id exists in the location table
        const locationExists = await pool.query(`SELECT * FROM location WHERE id = $1`, [location_id]);
        if (locationExists.rows.length === 0) {
            return res.status(400).json({ error: "Invalid location ID" });
        }

        // Fetch vehicles for the given category_id and location_id
        const vehiclesQuery = `
            SELECT v.* 
            FROM vehicles v
            WHERE v.category_id = $1 AND v.location_id = $2
        `;
        const vehicles = await pool.query(vehiclesQuery, [category_id, location_id]);

        if (vehicles.rows.length === 0) {
            return res.status(404).json({ message: "No vehicles found for the given location and category." });
        }

        res.status(200).json({ vehicles: vehicles.rows });

    } catch (error: any) {
        console.error("Error fetching vehicles:", error);
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



// export const editVehicle = async (req: any, res: any) => {
//     try {
//         const { id } = req.params;
//         const { category_id, name, number_plate_no, condition_vehicle, location_id, rent_per_day } = req.body;
//         const imagePath = req.file ? req.file.path : undefined; // Handle image upload with Multer

//         if (!id) {
//             return res.status(400).json({ message: "Vehicle ID is required" });
//         }

//         const result = await updateVehicle(parseInt(id), {
//             category_id, name, number_plate_no, condition_vehicle, location_id, rent_per_day
//         }, imagePath);

//         if (result.error) {
//             return res.status(404).json({ message: result.error });
//         }

//         res.status(200).json({ message: "Vehicle updated successfully", vehicle: result });

//     } catch (error: any) {
//         console.error("Error updating vehicle:", error);
//         res.status(500).json({ error: "Internal Server Error", details: error.message });
//     }
// };


export const editVehicle = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { category_id, name, number_plate_no, condition_vehicle, location_id, rent_per_day, availability_status } = req.body;
    const files = req.files as Express.Multer.File[] | undefined; // Fix: Allow undefined

    if (!id) {
        res.status(400).json({ error: "Vehicle ID is required." });
        return;
    }

    try {
        // Validate category_id and location_id
        if (category_id) {
            const categoryExists = await pool.query(`SELECT id FROM categories WHERE id = $1`, [category_id]);
            if (categoryExists.rowCount === 0) {
                res.status(400).json({ error: "Invalid category ID." });
                return;
            }
        }

        if (location_id) {
            const locationExists = await pool.query(`SELECT id FROM location WHERE id = $1`, [location_id]);
            if (locationExists.rowCount === 0) {
                res.status(400).json({ error: "Invalid location ID." });
                return;
            }
        }

        // Update vehicle details
        const updates: string[] = [];
        const values: (string | number)[] = [];

        if (category_id) updates.push(`category_id = $${updates.length + 1}`), values.push(category_id);
        if (name) updates.push(`name = $${updates.length + 1}`), values.push(name);
        if (number_plate_no) updates.push(`number_plate_no = $${updates.length + 1}`), values.push(number_plate_no);
        if (condition_vehicle) updates.push(`condition_vehicle = $${updates.length + 1}`), values.push(condition_vehicle);
        if (location_id) updates.push(`location_id = $${updates.length + 1}`), values.push(location_id);
        if (rent_per_day) updates.push(`rent_per_day = $${updates.length + 1}`), values.push(rent_per_day);
        if (availability_status) updates.push(`availability_status = $${updates.length + 1}`), values.push(availability_status);

        if (updates.length > 0) {
            values.push(id);
            const updateQuery = `
                UPDATE vehicles
                SET ${updates.join(", ")}
                WHERE id = $${values.length}
                RETURNING *;
            `;
            const result = await pool.query(updateQuery, values);

            if (result.rowCount === 0) {
                res.status(404).json({ error: "Vehicle not found or no changes applied." });
                return;
            }
        }

        // Check if a new image was uploaded
        if (files && files.length > 0) {
            const newImagePath = `/userUploads/${files[0].filename}`;

            // Update vehicle image in the database
            const imageUpdateResult = await pool.query(
                `UPDATE vehicles SET image = $1 WHERE id = $2 RETURNING *`,
                [newImagePath, id]
            );

            if (imageUpdateResult.rowCount === 0) {
                res.status(404).json({ error: "Failed to update image." });
                return;
            }
        }

        // Fetch updated vehicle details
        const vehicleResult = await pool.query(`SELECT * FROM vehicles WHERE id = $1`, [id]);

        if (vehicleResult.rowCount === 0) {
            res.status(404).json({ error: "Vehicle not found." });
            return;
        }

        // Format image URL correctly
        const vehicle = vehicleResult.rows[0];
        vehicle.image = vehicle.image ? `${req.protocol}://${req.get("host")}/${vehicle.image}` : null;

        res.status(200).json({ message: "Vehicle updated successfully.", vehicle });
    } catch (err) {
        console.error("Error updating vehicle:", (err as Error).message);
        res.status(500).json({ error: "Failed to update the vehicle." });
    }
};





// locations Details
export const addLocation = async (req: any, res: any) => {
    try {
        const { name } = req.body;

        if (!name || name.trim() === '') {
            return res.status(400).json({ message: "Location name is required" });
        }

        const locationResult = await createLocation(name);

        if (locationResult.existing) {
            return res.status(409).json({ message: "Location already exists", location: locationResult });
        }

        res.status(201).json({
            message: "Location created successfully",
            location: locationResult
        });

    } catch (error: any) {
        console.error("Error adding location:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
};

export const  getlocations = async (req:any, res:any) => {
    try {
        const result = await getLocations();
        return res.status(201).json ({message:"fetch successfully", result});

    } catch (error:any) {
        res.status(500).json({message:"internal server error", err:error.message})
    }
}

function updatedVehicle(arg0: number, arg1: { category_id: any; name: any; number_plate_no: any; condition_vehicle: any; location_id: any; rent_per_day: any; }, imagePath: any) {
    throw new Error('Function not implemented.');
}
