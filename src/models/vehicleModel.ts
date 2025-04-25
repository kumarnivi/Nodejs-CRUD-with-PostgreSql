import pool from '../repository/db'



// export const createVehicle = async (data: any, imagePath: string) => {
//     const {
//         category_id, name, number_plate_no, condition_vehicle, location_id, rent_per_day
//     } = data;

//     const query = `
//         INSERT INTO vehicles (category_id, name, number_plate_no, image, condition_vehicle, location_id, rent_per_day, availability_status)
//         VALUES ($1, $2, $3, $4, $5, $6, $7, 'available') RETURNING *`;

//     const values = [category_id, name, number_plate_no, imagePath, condition_vehicle, location_id, rent_per_day];

//     const { rows } = await pool.query(query, values);
//     return rows[0];
// };


export const createVehicle = async (data: any, imagePath: string) => {
    const { category_id, name, number_plate_no, condition_vehicle, location_id, rent_per_day } = data;

    // Validate required fields
    if (!category_id || !name || !number_plate_no || !condition_vehicle || !location_id || !rent_per_day) {
        return { error: "All fields are required" };
    }

    try {
        // Check if number_plate_no already exists
        const existingVehicle = await pool.query(
            "SELECT * FROM vehicles WHERE number_plate_no = $1",
            [number_plate_no]
        );

        if (existingVehicle.rows.length > 0) {
            return { error: "Vehicle with this number plate already exists" };
        }

        // Insert the vehicle
        const query = `
            INSERT INTO vehicles (category_id, name, number_plate_no, image, condition_vehicle, location_id, rent_per_day, availability_status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'available') RETURNING *`;

        const values = [category_id, name, number_plate_no, imagePath, condition_vehicle, location_id, rent_per_day];

        const { rows } = await pool.query(query, values);
        return rows[0];

    } catch (error: any) {
        console.error("Database error:", error);
        return { error: "Internal Server Error" };
    }
};



// UPDATE VECHILE

export const updateVehicle = async (vehicle_id: number, data: any, imagePath?: string) => {
    const { category_id, name, number_plate_no, condition_vehicle, location_id, rent_per_day, availability_status } = data;

    // Validate required fields (Exclude availability_status since it's optional)
    if (!category_id || !name?.trim() || !number_plate_no?.trim() || !condition_vehicle?.trim() || !location_id || !rent_per_day) {
        return { error: "All fields are required except availability_status" };
    }

    try {
        // Check if vehicle exists
        const existingVehicle = await pool.query(
            "SELECT * FROM vehicles WHERE id = $1",
            [vehicle_id]
        );

        if (existingVehicle.rows.length === 0) {
            return { error: "Vehicle not found" };
        }

        // Check if category_id exists
        const categoryExists = await pool.query(
            "SELECT * FROM categories WHERE id = $1",
            [category_id]
        );
        if (categoryExists.rows.length === 0) {
            return { error: "Invalid category ID" };
        }

        // Check if location_id exists
        const locationExists = await pool.query(
            "SELECT * FROM location WHERE id = $1",
            [location_id]
        );
        if (locationExists.rows.length === 0) {
            return { error: "Invalid location ID" };
        }

        // Check if number_plate_no already exists (excluding current vehicle)
        const plateExists = await pool.query(
            "SELECT * FROM vehicles WHERE number_plate_no = $1 AND id != $2",
            [number_plate_no, vehicle_id]
        );
        if (plateExists.rows.length > 0) {
            return { error: "Vehicle with this number plate already exists" };
        }

        // Use existing image if no new image is provided
        const finalImagePath = imagePath || existingVehicle.rows[0].image;

        // Use existing availability_status if not provided
        const finalAvailabilityStatus = availability_status || existingVehicle.rows[0].availability_status;

        // Update vehicle details
        const query = `
            UPDATE vehicles 
            SET category_id = $1, name = $2, number_plate_no = $3, image = $4, condition_vehicle = $5, 
                location_id = $6, rent_per_day = $7, availability_status = $8
            WHERE id = $9 
            RETURNING *`;

        const values = [category_id, name, number_plate_no, finalImagePath, condition_vehicle, location_id, rent_per_day, finalAvailabilityStatus, vehicle_id];

        const { rows } = await pool.query(query, values);
        return rows[0];

    } catch (error: any) {
        console.error("Database error:", error);
        return { error: "Internal Server Error" };
    }
};






export const getAllVechiles = async () => {
    const { rows } = await pool.query('SELECT * FROM vehicles');
    return rows;
};

export const createLocation = async (name: string) => {
    const normalizedName = name.toLowerCase().trim();

    // Check if location already exists (case-insensitive)
    const checkQuery = `SELECT * FROM location WHERE LOWER(name) = $1`;
    const checkResult = await pool.query(checkQuery, [normalizedName]);

    if (checkResult.rows.length > 0) {
        return { existing: true, ...checkResult.rows[0] }; // Return existing location
    }

    // Insert new location if not found
    const insertQuery = `INSERT INTO location (name) VALUES ($1) RETURNING *`;
    const insertResult = await pool.query(insertQuery, [name]); // Store original case

    return { existing: false, ...insertResult.rows[0] };
};


export const getLocations = async () => {
    const { rows} = await pool.query(`SELECT * FROM location`);
    return rows;
}


