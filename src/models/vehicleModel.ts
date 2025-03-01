import pool from '../repository/db'



export const createVehicle = async (data: any, imagePath: string) => {
    const {
        category_id, name, number_plate_no, condition_vehicle, location, rent_per_day
    } = data;

    const query = `
        INSERT INTO vehicles (category_id, name, number_plate_no, image, condition_vehicle, location, rent_per_day, availability_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'available') RETURNING *`;

    const values = [category_id, name, number_plate_no, imagePath, condition_vehicle, location, rent_per_day];

    const { rows } = await pool.query(query, values);
    return rows[0];
};


export const getAllVechiles = async () => {
    const { rows } = await pool.query('SELECT * FROM vehicles');
    return rows;
};