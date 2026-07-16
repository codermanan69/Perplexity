import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

export async function authUser( req , res , next){
    const token = req.cookies.token;

    if(!token){
        return res.status(401).json({
            message:"Unauthorized",
            success:false,
            err:"No token provided"
        })
    }

    try {
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                message: "Unauthorized",
                success: false,
                err: "User not found"
            });
        }

        if (user.isVerified === false) {
            return res.status(401).json({
                message: "Please verify your email address.",
                success: false,
                err: "Email not verified"
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message : "Unauthorized",
            success: false,
            err:"Invalid Token"
        })
        
    }


}