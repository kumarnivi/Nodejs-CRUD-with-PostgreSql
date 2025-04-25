require('dotenv').config();
import express from 'express';
import router from './routes';
import authRouter from './routes/AuthRoutes';
import path from 'path';
import cors from 'cors'; 
import cookieParser from "cookie-parser";
import passport from 'passport';
import session from "express-session";
import categoryRoutes from './routes/categoryRoutes';
import vechicleRoutes from './routes/vehicleRoutes';
import bookingRouts from './routes/BookingRoutes';



const app = express();
const PORT = 8080;

// Enable CORS
app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
    credentials: true 
}));
app.use(cookieParser())
// Increase the request payload size limit to handle larger image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Initialize Passport
app.use(session({ secret: process.env.JWT_SECRET as string, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// profile image uploaded
app.use('/userUploads', express.static(path.join(__dirname, 'userUploads')));

// API routes
app.use('/api', router);
app.use('/auth', authRouter);

app.use('/', categoryRoutes)
app.use('/', vechicleRoutes);
app.use('/', bookingRouts)

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

