// // src/data-source.ts
// import 'reflect-metadata';
// import { DataSource } from 'typeorm';
// import { User } from './entities/User';


// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: "localhost",
//   port: 5432,
//   username: "postgres", 
//   password: "root0",  
//   database: "postgres",  
//   synchronize: false,
//   logging: true,
//   entities: ["src/entities/User.ts"],
//   migrations: ["src/migrations/*.ts"],
//   subscribers: [],
// });

// AppDataSource.initialize()
//   .then(() => {
//     console.log("Data Source has been initialized!");
//   })
//   .catch((err: any) => {
//     console.error("Error during Data Source initialization:", err);
//   });


import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User";
import { Booking } from "./entities/Booking";
import { Vehicle } from "./entities/Vehicle";
import { Category } from "./entities/Category";
import { Location } from "./entities/Location";


export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  ssl: { rejectUnauthorized: false }, // ✅ for Supabase
  entities: [User, Booking, Vehicle, Category, Location],
});