// import passport from "passport";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// import pool from "../repository/db"; // Your database connection file
// import jwt from "jsonwebtoken";

// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID as string,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
//       callbackURL: "/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         // Check if user already exists in the database
//         const existingUser = await pool.query(
//           `SELECT * FROM public."users" WHERE email = $1`,
//           [profile.emails?.[0].value]
//         );

//         if (existingUser.rows.length > 0) {
//           return done(null, existingUser.rows[0]);
//         }

//         // If user does not exist, create a new user
//         const newUser = await pool.query(
//           `INSERT INTO public."users" (username, email, password, role, profileimage)
//            VALUES ($1, $2, $3, $4, $5) RETURNING *`,
//           [
//             profile.displayName,
//             profile.emails?.[0].value,
//             "", // No password for Google users
//             "user", // Default role
//             profile.photos?.[0].value || "", // Profile image
//           ]
//         );

//         return done(null, newUser.rows[0]);
//       } catch (err) {
//         console.error("Error in Google Authentication:", err);
//         return done(err, null);
//       }
//     }
//   )
// );

// // Serialize user (store in session or JWT)
// passport.serializeUser((user: any, done) => {
//   done(null, user.id);
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await pool.query(`SELECT * FROM public."users" WHERE id = $1`, [id]);
//     done(null, user.rows[0]);
//   } catch (err) {
//     done(err, null);
//   }
// });

// export default passport;
