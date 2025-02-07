import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();



const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// **User Registration**
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const userRepo = getRepository(User);

    // Check if email exists
    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = userRepo.create({
      username,
      email,
      password: hashedPassword,
      image: req.file?.filename || null,
    });

    await userRepo.save(newUser);
    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// **User Login**
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const userRepo = getRepository(User);

    const user = await userRepo.findOne({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isValidPassword =  bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token, user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// **Update User Image**
export const updateImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRepo = getRepository(User);

    const user = await userRepo.findOne({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.image = req.file?.filename || user.image;
    await userRepo.save(user);

    res.json({ message: "Image updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// **Delete User Image**
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userRepo = getRepository(User);

    const user = await userRepo.findOne({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.image = null;
    await userRepo.save(user);

    res.json({ message: "Image deleted successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
