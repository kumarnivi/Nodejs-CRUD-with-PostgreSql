import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'root0',
    port: 5432, // Default PostgreSQL port
});

export default pool;
