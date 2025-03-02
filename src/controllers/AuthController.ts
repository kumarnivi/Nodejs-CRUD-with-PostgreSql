import { Request, response} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../repository/db";
import nodemailer from "nodemailer";
import crypto from "crypto";

import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



export class AuthController  {
    static async register(req:any, res:any) {
        const {username, email,password,role} = req.body;
        const profileImage = req.file ? req.file.filename : '';

        try {
            const existingUser = await pool.query(`SELECT * FROM public."users" WHERE email = $1`, [email]);

            if (existingUser.rows.length > 0){
                return res.status(400).json({ message: "User already exists" });
            } 
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = pool.query(`INSERT INTO "users" (username, email, password, role, profileImage)
            VALUES ($1, $2, $3, $4, $5)`, [username, email, hashedPassword, role, profileImage]);   

            res.status(201).json({message:'User registered successfully',newUser})
        } 
         catch (err) {
            res.status(500).json({message:"Server Error", err})
        } 
    }
    
    static async login(req: any, res: any) {

        const { email, password } = req.body;    

        try {
          // Check if the user exists
          const userResult = await pool.query(`SELECT * FROM public."users" WHERE email = $1`, [email]);
          if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "Invalid Credentials" });
          }
          const user = userResult.rows[0];
    
          // Check password
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
          }
    
          // Generate JWT
          const token = jwt.sign({ id:user.id, role:user.role }, process.env.JWT_SECRET as string, {
            expiresIn: "1h"
          });

          res.cookie("token", token, { httpOnly: true ,
                                    secure: true,       // Required for SameSite=None
                                    sameSite: "None",   // Allows cross-origin
                                    path: "/", 
          });

          res.cookie("userId", user.id, { httpOnly: true ,
            secure: true,       // Required for SameSite=None
            sameSite: "None",   // Allows cross-origin
            path: "/", 
});

          res.status(200).json({ message: "Logged in Successfully!" , token, user:user.role });

        } catch (err:any) {
          console.error("Login Error: ", err);
          res.status(500).json({ message: "Server Error", error: err.message });
          
        }
      }

      // google
      static async googleLogin(req: any, res: any) {
        try {
            const { token } = req.body;
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
    
            const payload = ticket.getPayload();
            if (!payload) {
                return res.status(400).json({ message: "Invalid Google token" });
            }
    
            console.log("Google User Info:", payload);
    
            const userResult = await pool.query(
                `SELECT * FROM public."users" WHERE email = $1`, [payload.email]
            );
    
            let user;
            if (userResult.rows.length === 0) {
                // Insert new user into PostgreSQL
                const insertQuery = `
                    INSERT INTO public."users" (username, email, profileImage, role)
                    VALUES ($1, $2, $3, $4) RETURNING *`;
                const insertResult = await pool.query(insertQuery, [
                    payload.name, payload.email, payload.picture, "user"
                ]);
                user = insertResult.rows[0];
            } else {
                user = userResult.rows[0];
            }
    
            // Generate JWT
            const authToken = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET || "default_secret",
                { expiresIn: "1d" }
            );
    
            res.json({ token: authToken, user , role:user.role});
        } catch (error) {
            console.error("Google Authentication Error:", error);
            res.status(401).json({ message: "Google Authentication Failed" });
        }
    }
    
 

 
 // Forgot Password with OTP
static async forgotPassword(req: any, res: any) {
  const { email } = req.body;

  try {
      // Check if the user exists
      const userResult = await pool.query(`SELECT * FROM public."users" WHERE email = $1`, [email]);
      if (userResult.rows.length === 0) {
          return res.status(400).json({ message: "User not found" });
      }

      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

      // Store OTP and expiry in the database
      await pool.query(
          `UPDATE public."users" SET otp = $1, otp_expiry = $2 WHERE email = $3`, 
          [otp, otpExpiry, email]
      );

      // Send OTP via Email
      const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
          },
      });

      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Your Password Reset OTP",
          html: `<p>Your OTP for password reset is: <b>${otp}</b></p>
                 <p>This OTP is valid for 10 minutes.</p>`,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: "OTP sent to email" });

  } catch (err: any) {
      console.error("Forgot Password OTP Error:", err);
      res.status(500).json({ message: "Server Error", error: err.message });
  }
}


// static async verifyOTP(req: any, res: any) {
//   const { email, otp } = req.body;

//   try {
//       // Check if the OTP is valid
//       const userResult = await pool.query(
//           `SELECT * FROM public."users" WHERE email = $1 AND otp = $2 AND otp_expiry > NOW()`, 
//           [email, otp]
//       );

//       if (userResult.rows.length === 0) {
//           return res.status(400).json({ message: "Invalid or expired OTP" });
//       }

//       res.status(200).json({ message: "OTP verified successfully" });

//   } catch (err: any) {
//       console.error("OTP Verification Error:", err);
//       res.status(500).json({ message: "Server Error", error: err.message });
//   }
// }




  // Reset Password


  static async resetPassword(req: any, res: any) {
      const { email, otp, newPassword } = req.body;
  
      try {
          // Verify OTP
          const userResult = await pool.query(
              `SELECT * FROM public."users" WHERE email = $1 AND otp = $2 AND otp_expiry > NOW()`, 
              [email, otp]
          );
  
          if (userResult.rows.length === 0) {
              return res.status(400).json({ message: "Invalid or expired OTP" });
          }
  
          const user = userResult.rows[0];
  
          // Hash new password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(newPassword, salt);
  
          // Update password and clear OTP fields
          await pool.query(
              `UPDATE public."users" SET password = $1, otp = NULL, otp_expiry = NULL WHERE email = $2`, 
              [hashedPassword, email]
          );
  
          res.status(200).json({ message: "Password reset successfully" });
  
      } catch (err: any) {
          console.error("Reset Password Error:", err);
          res.status(500).json({ message: "Server Error", error: err.message });
      }
  }
  


// edit Profile image
    static async editProfile (req:any, res:any)  { 
        const { id } = req.user;
        const { email } = req.body;
        const profileImage = req.file ?  req.file.filename : undefined;
        try {
            const user = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
            
            if(user.rows.length === 0) {
                return res.status(400).json({message:"User not found"})
            };
           
        // update the user profile 
        await pool.query(`UPDATE users SET 
          email = COALESCE($1, email), 
          profileImage = COALESCE($2, profileImage) 
         WHERE id = $3`, [email, profileImage, id])

            res.status(200).json({message:"updated Successfully"});

        } catch (err) {
          res.status(500).json({message:"server Error", err})
        }
    }

    static async getAllUsers(req:any, res:any,next:any) {
      try{
        const users = await pool.query(`SELECT * FROM public."users"`);
        res.status(201).json({ message:"True",
          users: users.rows
        })
      } catch (err) {
        res.status(500).json({message:"Server Error"})
      }
    }



    static async logout(req: any, res: any) {
      try {
        // Clear the token cookie
        res.clearCookie('token', { httpOnly: true });
        res.status(200).json({ message: 'Logged out successfully!' });
      } catch (err: any) {
        console.error("Logout Error: ", err);
        res.status(500).json({ message: "Server Error", error: err.message });
      }
    }
}

