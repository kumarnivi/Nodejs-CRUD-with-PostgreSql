import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { verifyToken, checkRole } from "../middleware/AuthMiddleware";
import { upload } from "../config/multer";




const authRouter = Router();
  
authRouter.post('/google-login',AuthController.googleLogin);
authRouter.post('/register', upload.single("profileImage"), AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.put('/edit-profile', verifyToken, upload.single("profileImage"), AuthController.editProfile)
authRouter.post('/logout', AuthController.logout)
authRouter.post('/forgot-password', AuthController.forgotPassword);
authRouter.post('/reset-password', AuthController.resetPassword);

// Protect Routes
authRouter.get("/user", verifyToken, checkRole(["user"]), (req,res) => {
    res.json({message:"Welcom User"})
})

authRouter.get('/admin', verifyToken, checkRole(["admin"]), (req,res) => {
    res.json({message:"Welcom Admin!"})
})

// all users
authRouter.get('/users',AuthController.getAllUsers)

export default authRouter;

