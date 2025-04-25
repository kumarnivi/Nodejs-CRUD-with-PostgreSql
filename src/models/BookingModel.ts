import pool from '../repository/db';

export const bookVehicle = async (userId: number, data: any) => {
    const { vehicle_id, rent_started_date, rent_ended_date, user_nic } = data;

    try {
        // Get user details from users table
        const userQuery = `SELECT username, email FROM users WHERE id = $1`;
        const userResult = await pool.query(userQuery, [userId]);

        if (userResult.rows.length === 0) {
            throw new Error("User not found");
        }

        const { username, email } = userResult.rows[0];

        // Get vehicle details
        const vehicleQuery = `SELECT rent_per_day, category_id FROM vehicles WHERE id = $1 AND availability_status = $2`;
        const vehicleResult = await pool.query(vehicleQuery, [vehicle_id, 'available']);

        if (vehicleResult.rows.length === 0) {
            throw new Error("Vehicle not available for booking.");
        }

        const { rent_per_day, category_id } = vehicleResult.rows[0];

        // Calculate total payment
        const startDate = new Date(rent_started_date);
        const endDate = new Date(rent_ended_date);
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        const totalPayment = totalDays * rent_per_day;

        // Insert booking record with user details (including user_nic)
        const bookingQuery = `
            INSERT INTO bookings (user_id, user_nic, vehicle_id, rent_started_date, rent_ended_date, total_payment, category_type)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`;

        const bookingValues = [userId, user_nic, vehicle_id, rent_started_date, rent_ended_date, totalPayment, category_id];

        const bookingResult = await pool.query(bookingQuery, bookingValues);

        // Update vehicle availability status
        await pool.query('UPDATE vehicles SET availability_status = $1 WHERE id = $2', ['booked', vehicle_id]);

        return bookingResult.rows[0];

    } catch (error: any) {
        throw new Error(error.message);
    }
};

export const Allbooking = async () => {
    const { rows } = await pool.query('SELECT * FROM bookings');
    return rows;
};