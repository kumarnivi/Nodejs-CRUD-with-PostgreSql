export const createUser = ` INSERT INTO users (username, email, password)
    VALUES ($1, $2, $3)
    RETURNING id, username, email;`;


    export const findUserByEmail = `
    SELECT * FROM users WHERE email = $1;`;
    