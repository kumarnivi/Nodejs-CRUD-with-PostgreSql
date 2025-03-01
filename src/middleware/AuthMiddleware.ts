import { Request, Response, NextFunction } from "express";
import  Jwt  from "jsonwebtoken";

export const verifyToken = (req:any ,res:any, next:any) => {
    const token     = req.cookies?.token;
    if(!token) {
        res.status(400).json({message:"NO Token Provided"});
    }
    try {
        const decoded = Jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        next()
    } catch (err) {
        res.status(401).json({messsage:"Invalid Token"})
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
