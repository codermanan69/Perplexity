import { Router } from "express";
import { register, verifyEmail , login ,getMe} from "../controllers/auth.controller.js";
import { registerValidator,loginValidator } from "../validators/auth.validator.js";
import {authUser} from "../middlewares/auth.middleware.js"

const authRouter = Router();

authRouter.post("/register", registerValidator, register);

authRouter.get("/verify-email", verifyEmail)

authRouter.post("/login",loginValidator ,login);

authRouter.get('/get-me',authUser, getMe)

export default authRouter;