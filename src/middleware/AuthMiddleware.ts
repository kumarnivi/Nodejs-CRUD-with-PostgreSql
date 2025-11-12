import { Request, Response, NextFunction } from "express";
import  jwt  from "jsonwebtoken";

export const verifyToken = (req: any, res: any, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" }); // ✅ return added
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" }); // ✅ return added
  }
};
export const checkRole = (roles:Array<string>) => {
    return (req:any, res:any, next:any) => {
        if(!roles.includes(req.user.role)) {
            return res.status(403).json({ message:"Access Denied" })
        }
        next()
    }
}   
