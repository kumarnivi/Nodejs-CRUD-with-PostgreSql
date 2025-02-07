import express, { Request,Response } from 'express';
import pool from '../repository/db';
import fs from 'fs'
import path from 'path';
import multer from 'multer';

// export interface Car {
//     name:string;
//     model:string;
//     brand:string;
//     year:number;
// }

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });



//get all cars 
export const getAllCars = async ( req:Request,res:Response):Promise<void> => {
  
    try {
        const result =await pool.query(`SELECT * FROM cars`);
        res.status(200).json(result.rows)
    }catch (err) {
        console.log('error fetching cars:', (err as Error).message);
        res.status(500).json('server Error');
    }
}



// create Cars
export const creatCars =  async (req: Request, res: Response): Promise<void> => {
    const { name, brand, model, year } = req.body;
    const imageData = req.file?.path

    if (!name || !brand || !model || !year || !imageData ) {
         res.status(400).json({ error: 'All fields (name, brand, model, year, image) are required.' })
         return;
    }
    try {

        const image  = fs.readFileSync(imageData)
    const query = `
        INSERT INTO cars (name, brand, model, year, image)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;`;
    const values: [string, string, string, number, Buffer] = [name, brand, model, year,image];

  
        console.log('Query:', query);
        console.log('Values:', values);

        const result = await pool.query(query, values);
        res.status(201).json({ message: 'Car added successfully', car: result.rows[0] });
    } catch (err) {
        console.error('Database Insert Error:', (err as Error).message);
        res.status(500).json({ error: 'Failed to add the car. Please try again later.' });
    }
}

// get single Cars
export const getSingleCars = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
       
        const query = 'SELECT * FROM cars WHERE id = $1;';
        const result = await pool.query(query, [id]);


        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Car not found.' });
            return;
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching car:', (err as Error).message);
        res.status(500).json({ error: 'Failed to fetch the car. Please try again later.' });
    }
};

export const editCars = [
    upload.single('image'),  // Handle a single image
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const { name, brand, model, year, removeImage } = req.body;

        if (!id || (!name && !brand && !model && !year && !req.file && !removeImage)) {
            res.status(400).json({ error: 'ID and at least one field (name, brand, model, year, or image) are required.' });
            return;
        }

        try {
            // Update car details if provided
            const updates: string[] = [];
            const values: (string | number)[] = [];

            if (name) updates.push(`name = $${updates.length + 1}`), values.push(name);
            if (brand) updates.push(`brand = $${updates.length + 1}`), values.push(brand);
            if (model) updates.push(`model = $${updates.length + 1}`), values.push(model);
            if (year) updates.push(`year = $${updates.length + 1}`), values.push(year);

            if (updates.length > 0) {
                values.push(id);
                const updateQuery = `
                    UPDATE cars
                    SET ${updates.join(', ')}
                    WHERE id = $${values.length}
                    RETURNING *;
                `;
                await pool.query(updateQuery, values);
            }

            // Remove existing image if requested
            if (removeImage === 'true') {
                await pool.query(`UPDATE cars SET image = NULL WHERE id = $1`, [id]);
            }

            // Handle new image upload
            if (req.file) {
                const image = fs.readFileSync(req.file.path);
                await pool.query(`UPDATE cars SET image = $1 WHERE id = $2`, [image, id]);

                // Delete the temporary uploaded file
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error('Error deleting temp file:', err);
                });
            }

            // Fetch the updated car
            const carResult = await pool.query(`SELECT * FROM cars WHERE id = $1`, [id]);

            if (carResult.rowCount === 0) {
                res.status(404).json({ error: 'Car not found.' });
                return;
            }

            res.status(200).json({ message: 'Car updated successfully.', car: carResult.rows[0] });
        } catch (err) {
            console.error('Error updating car:', (err as Error).message);
            res.status(500).json({ error: 'Failed to update the car.' });
        }
    }
];

// delete the cars 
export const deleteCar = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    if (!id) {
        res.status(400).json({ error: 'Car ID is required.' });
        return;
    }

    try {
        
        const query = 'DELETE FROM cars WHERE id = $1 RETURNING *;';
        const values = [id];

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Car not found.' });
            return;
        }

        res.status(200).json({ message: 'Car deleted successfully.', car: result.rows[0] });
    } catch (err) {
        console.error('Error deleting car:', (err as Error).message);
        res.status(500).json({ error: 'Failed to delete the car. Please try again later.' });
    }
};
