// import { Router } from "express";
// import { AuthController } from "../controllers/AuthController";
// import { verifyToken, checkRole } from "../middleware/AuthMiddleware";
// import { upload } from "../config/multer";




// const authRouter = Router();
  
// authRouter.post('/google-login',AuthController.googleLogin);
// authRouter.post('/register', upload.single("profileImage"), AuthController.register);
// authRouter.post('/login', AuthController.login);
// authRouter.put('/edit-profile', verifyToken, upload.single("profileImage"), AuthController.editProfile)
// authRouter.post('/logout', AuthController.logout)
// authRouter.post('/forgot-password', AuthController.forgotPassword);
// authRouter.post('/reset-password', AuthController.resetPassword);

// // Protect Routes
// authRouter.get("/user", verifyToken, checkRole(["user"]), (req,res) => {
//     res.json({message:"Welcom User"})
// })

// authRouter.get('/admin', verifyToken, checkRole(["admin"]), (req,res) => {
//     res.json({message:"Welcom Admin!"})
// })

// // all users
// authRouter.get('/users',AuthController.getAllUsers)

// export default authRouter;
import express from 'express';
import { AuthController } from '../controllers/AuthController';
import { verifyToken, checkRole } from '../middleware/AuthMiddleware';
import upload from '../middleware/upload';

const userRouter = express.Router();

// Get all users (admin)
userRouter.get('/', verifyToken, checkRole(["admin"]), AuthController.getAllUsers);

// Get single user by ID (admin)
// userRouter.get('/:id', verifyToken, checkRole(["admin"]), AuthController.getSingleUser);

// Create a new user (admin) with profile image
userRouter.post(
  '/',
  upload.single("profileImage"), // "profileImage" matches the field in the request form
  AuthController.register
);

// Update existing user (admin)
// userRouter.put(
//   '/:id',
//   verifyToken,
//   checkRole(["admin"]),
//   upload.single("profileImage"),
//   AuthController.updateUser
// );

// Delete user (admin)
// userRouter.delete('/:id', verifyToken, checkRole(["admin"]), AuthController.deleteUser);

// User self-update (optional) if you want authenticated users to edit their own profile
userRouter.put(
  '/profile/edit',
  verifyToken,
  upload.single("profileImage"),
  AuthController.editProfile
);

export default userRouter;
