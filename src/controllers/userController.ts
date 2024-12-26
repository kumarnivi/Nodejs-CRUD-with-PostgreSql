import { Request, Response } from "express";
import { Jwt } from "jsonwebtoken";
import bcrypt from 'bcryptjs'

import { createUser, findUserByEmail } from "../repository/userSheama";
import { json } from "sequelize";

const seceretKey = 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.tyh-VfuzIxCyGYDlkBA7DfyjrqmSHu6pQ2hoZuFqUSLPNY2N0mpHb3nk5K17HWP_3cYHBw7AhHale5wky6-sVA'

export const register = async (req:Request, res:Response) => {
 const {username, email, password} = req.body;

 try{


 } catch (err) {
    console.log('error found')
    res.status(500),json('server Error', (err as Error).message)
 }
}