import 'dotenv/config';
import dotenv from 'dotenv';
dotenv.config(); // Ensure .env is loaded before anything else

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import cors from 'cors';
import cookieParser from "cookie-parser";
import passport from 'passport';
import session from "express-session";

import authRouter from './routes/AuthRoutes';
import categoryRoutes from './routes/categoryRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import bookingRoutes from './routes/BookingRoutes';

import { AppDataSource } from './data-source'; // TypeORM DataSource

const app = express();
const PORT = 8080;

// ------------------ SUPABASE ------------------
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
console.log('🧩 Supabase client initialized.');

// ------------------ MIDDLEWARES ------------------
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(session({
  secret: process.env.JWT_SECRET as string,
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Static paths
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/userUploads', express.static(path.join(__dirname, 'userUploads')));

// ------------------ ROUTES ------------------
app.use('/auth', authRouter);
app.use('/', categoryRoutes);
app.use('/', vehicleRoutes);
app.use('/', bookingRoutes);

// ------------------ DATABASE INIT ------------------
AppDataSource.initialize()
  .then(() => {
    console.log("✅ TypeORM connected and tables are ready!");

    // Start server only after DB is ready
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ TypeORM failed to connect:", err);
    process.exit(1);
  });
