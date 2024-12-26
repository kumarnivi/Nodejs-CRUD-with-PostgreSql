import express, { Request,Response } from 'express';
import pool from '../repository/db';

// export interface Car {
//     name:string;
//     model:string;
//     brand:string;
//     year:number;
// }


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

    if (!name || !brand || !model || !year) {
         res.status(400).json({ error: 'All fields (name, brand, model, year) are required.' })
         return;
    }

    const query = `
        INSERT INTO cars (name, brand, model, year)
        VALUES ($1, $2, $3, $4)
        RETURNING *;`;
    const values: [string, string, string, number] = [name, brand, model, year];

    try {
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

// update the cars
export const editCars = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params; // Car ID to update
    const { name, brand, model, year } = req.body; // Fields to update

    if (!id || (!name && !brand && !model && !year)) {
        res.status(400).json({ error: 'ID and at least one field (name, brand, model, or year) are required.' });
        return;
    }

    try {
        // Prepare query parts
        const updates: string[] = [];
        const values: (string | number)[] = [];

        if (name) updates.push(`name = $${updates.length + 1}`), values.push(name);
        if (brand) updates.push(`brand = $${updates.length + 1}`), values.push(brand);
        if (model) updates.push(`model = $${updates.length + 1}`), values.push(model);
        if (year) updates.push(`year = $${updates.length + 1}`), values.push(year);

        // Add ID for the WHERE clause
        values.push(id);

        // SQL query
        const query = `
            UPDATE cars
            SET ${updates.join(', ')}
            WHERE id = $${values.length}
            RETURNING *;
        `;

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            res.status(404).json({ error: 'Car not found.' });
            return;
        }

        res.status(200).json({ message: 'Car updated successfully.', car: result.rows[0] });
    } catch (err) {
        console.error('Error updating car:', (err as Error).message);
        res.status(500).json({ error: 'Failed to update the car.' });
    }
};


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
