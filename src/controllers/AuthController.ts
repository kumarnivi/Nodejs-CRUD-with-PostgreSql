import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, Role } from "../entities/User";
import nodemailer from "nodemailer";
import { Booking } from "../entities/Booking";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export class AuthController {

  // Register
  static async register(req: any, res: any) {
    const { username, email, password, role } = req.body;
    const profileImage = req.file ? req.file.filename : undefined;

    try {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) return res.status(400).json({ message: "User already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = User.create({
        username,
        email,
        password: hashedPassword,
        role: role || Role.USER,
        profileImage,
      });

      await newUser.save();
      res.status(201).json({ message: "User registered successfully", newUser });
    } catch (err: any) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }

  // Login
  static async login(req: any, res: any) {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(400).json({ message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "1h" });

      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: "/",
      });

      res.status(200).json({ message: "Logged in successfully!", token, role: user.role });
    } catch (err: any) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }

  // Google Login
  static async googleLogin(req: Request, res: Response) {
    try {
      const { token } = req.body;
      const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();

      if (!payload) return res.status(400).json({ message: "Invalid Google token" });

      let user = await User.findOne({ where: { email: payload.email } });

      if (!user) {
        user = User.create({
          username: payload.name,
          email: payload.email,
          profileImage: payload.picture,
          role: Role.USER,
          password: "", // Optional for Google login
        });
        await user.save();
      }

      const authToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: "1d" });
      res.json({ token: authToken, user, role: user.role });
    } catch (error) {
      console.error("Google Authentication Error:", error);
      res.status(401).json({ message: "Google Authentication Failed" });
    }
  }

// Forgot Password (OTP)
static async forgotPassword(req: any, res: any) {
  const { email } = req.body;
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = otp.toString();
    user.otp_expiry = otpExpiry;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Password Reset OTP",
      html: `<p>Your OTP for password reset is: <b>${otp}</b></p>
             <p>This OTP is valid for 10 minutes.</p>`,
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err: any) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

// Reset Password
static async resetPassword(req: any, res: any) {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({
      where: { email },
      select: ["id", "otp", "otp_expiry", "password"] // need otp fields to be selected
    });

    if (!user || user.otp !== otp || !user.otp_expiry || user.otp_expiry < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err: any) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
}

  // Edit Profile
  static async editProfile(req: any, res: any) {
    const { id } = req.user;
    const { email } = req.body;
    const profileImage = req.file ? req.file.filename : undefined;

    try {
      const user = await User.findOne({ where: { id } });
      if (!user) return res.status(400).json({ message: "User not found" });

      user.email = email || user.email;
      if (profileImage) user.profileImage = profileImage;
      await user.save();

      res.status(200).json({ message: "Updated successfully", user });
    } catch (err: any) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }

  // Get all users
  static async getAllUsers(req: any, res: any) {
    try {
      const users = await User.find();
      res.status(200).json({ message: "Success", users });
    } catch (err: any) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }

  // Logout
  static async logout(req: any, res: any) {
    try {
      res.clearCookie("token", { httpOnly: true });
      res.status(200).json({ message: "Logged out successfully" });
    } catch (err: any) {
      res.status(500).json({ message: "Server Error", error: err.message });
    }
  }
}
