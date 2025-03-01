import pool from '../repository/db';

export const getCategories = async () => {
    const { rows } = await pool.query('SELECT * FROM categories');
    return rows;
};

export const createCategory = async (name: string) => {
    const { rows } = await pool.query(
        `INSERT INTO categories (name) VALUES ($1) RETURNING *`,
        [name]
    );
    return rows[0];
};