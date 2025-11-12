// import express, { Request, Response } from 'express';
// import pool from '../repository/db';
// import fs from 'fs';
// import path from 'path';
// import multer from 'multer';

// // Ensure uploads directory exists
// const uploadDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // Multer setup for image uploads
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, uploadDir),
//     filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
// });
// const upload = multer({ storage });

// // Serve images statically
// const app = express();
// app.use('/uploads', express.static(uploadDir));



// // Create a new car
// export const createCars = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { name, brand, model, year } = req.body;
        
//         // Handle image upload
//         let images: string[] = [];
//         if (req.files && Array.isArray(req.files)) {
//             images = req.files.map((file) => `/uploads/${file.filename}`);
//         }

//         // Insert the new car into the database
//         const query = `INSERT INTO cars (name, brand, model, year, image) VALUES ($1, $2, $3, $4, $5::text[]) RETURNING *`;
//         const values = [name, brand, model, year, images];
//         const result = await pool.query(query, values);

//         res.status(201).json(result.rows[0]);
//     } catch (err) {
//         console.error("Database Insert Error:", (err as Error).message);
//         res.status(500).json({ error: "Server Error" });
//     }
// };


// // Get all cars
// export const getAllCars = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const result = await pool.query(`SELECT id, name, brand, model, year, image FROM cars`);

//         // Format image URLs
//         const formattedCars = result.rows.map((car) => {
//             let images: string[] = [];

//             // Check if image is a string and try to parse it as JSON
//             if (typeof car.image === 'string') {
//                 try {
//                     // Try parsing as JSON array
//                     images = JSON.parse(car.image);

//                     // If the parsed result is not an array, wrap it in an array
//                     if (!Array.isArray(images)) {
//                         images = [car.image];
//                     }
//                 } catch (err) {
//                     // If parsing fails, treat it as a single image string
//                     images = [car.image];
//                 }
//             } else if (Array.isArray(car.image)) {
//                 // If already an array, use it as is
//                 images = car.image;
//             }

//             return {
//                 ...car,
//                 image: images.map((img: string) => `${req.protocol}://${req.get('host')}${img}`),
//             };
//         });

//         res.status(200).json(formattedCars);
//     } catch (err) {
//         console.error("Error fetching cars:", (err as Error).message);
//         res.status(500).json({ error: "Server Error" });
//     }
// };



// // Get single Car
// export const getSingleCars = async (req: Request, res: Response): Promise<void> => {
//     const { id } = req.params;

//     try {
//         const query = 'SELECT * FROM cars WHERE id = $1;';
//         const result = await pool.query(query, [id]);

//         if (result.rowCount === 0) {
//             res.status(404).json({ error: 'Car not found.' });
//             return;
//         }

//         // Format image URLs
//         const car = result.rows[0];

//         if (car.image) {
//             // Parse JSON string to array
//             const imageArray = JSON.parse(car.image);
//             // Map to correct URL format
//             car.image = imageArray.map((img: string) => `${req.protocol}://${req.get('host')}${img}`);
//         } else {
//             car.image = [];
//         }

//         res.status(200).json(car);
//     } catch (err) {
//         console.error('Error fetching car:', (err as Error).message);
//         res.status(500).json({ error: 'Failed to fetch the car. Please try again later.' });
//     }
// };



// // Edit Cars
// export const editCars = async (req: Request, res: Response): Promise<void> => {
//     const { id } = req.params;
//     const { name, brand, model, year, removeImage } = req.body; // Changed to removeImage for a single image
//     const files = req.files as Express.Multer.File[];

//     // Check if ID is provided
//     if (!id) {
//         res.status(400).json({ error: 'ID is required.' });
//         return;
//     }

//     try {
//         // Update basic details
//         const updates: string[] = [];
//         const values: (string | number)[] = [];

//         if (name) updates.push(`name = $${updates.length + 1}`), values.push(name);
//         if (brand) updates.push(`brand = $${updates.length + 1}`), values.push(brand);
//         if (model) updates.push(`model = $${updates.length + 1}`), values.push(model);
//         if (year) updates.push(`year = $${updates.length + 1}`), values.push(year);

//         if (updates.length > 0) {
//             values.push(id);
//             const updateQuery = `
//                 UPDATE cars
//                 SET ${updates.join(', ')}
//                 WHERE id = $${values.length}
//                 RETURNING *;
//             `;
//             await pool.query(updateQuery, values);
//         }

//         // Handle multiple image uploads
//         if (files.length > 0) {
//             const imageUrls = files.map(file => `/uploads/${file.filename}`);
//             console.log('Uploaded Files:', imageUrls);

//             // Append new images to the existing array
//             await pool.query(
//                 `UPDATE cars SET image = COALESCE(array_cat(image, $1::text[]), $1::text[]) WHERE id = $2`,
//                 [imageUrls, id]
//             );
//         }

//         // Remove a specific image if requested
//         if (removeImage) {
//             await pool.query(
//                 `UPDATE cars SET image = array_remove(image, $1) WHERE id = $2`,
//                 [removeImage, id]
//             );
//         }

//         // Fetch the updated car details
//         const carResult = await pool.query(`SELECT * FROM cars WHERE id = $1`, [id]);

//         if (carResult.rowCount === 0) {
//             res.status(404).json({ error: 'Car not found.' });
//             return;
//         }

//         // Format image URLs for frontend
//         const car = carResult.rows[0];
//         car.image = car.image && car.image.length > 0 
//             ? car.image.map((img: string) => `${req.protocol}://${req.get('host')}${img}`) 
//             : [];

//         res.status(200).json({ message: 'Car updated successfully.', car });
//     } catch (err) {
//         console.error('Error updating car:', (err as Error).message);
//         res.status(500).json({ error: 'Failed to update the car.' });
//     }
// };



// // Delete Cars
// export const deleteCar = async (req: Request, res: Response): Promise<void> => {
//     const { id } = req.params;

//     if (!id) {
//         res.status(400).json({ error: 'Car ID is required.' });
//         return;
//     }

//     try {
//         const query = 'DELETE FROM cars WHERE id = $1 RETURNING *;';
//         const values = [id];

//         const result = await pool.query(query, values);

//         if (result.rowCount === 0) {
//             res.status(404).json({ error: 'Car not found.' });
//             return;
//         }

//         res.status(200).json({ message: 'Car deleted successfully.', car: result.rows[0] });
//     } catch (err) {
//         console.error('Error deleting car:', (err as Error).message);
//         res.status(500).json({ error: 'Failed to delete the car. Please try again later.' });
//     }
// };
