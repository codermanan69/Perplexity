import { Router } from "express";
import { register, verifyEmail, login, getMe, resendVerification } from "../controllers/auth.controller.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";
import { authUser } from "../middlewares/auth.middleware.js"

const authRouter = Router();

authRouter.post("/register", registerValidator, register);

authRouter.get("/verify-email", verifyEmail)

authRouter.post("/resend-verification", resendVerification)

authRouter.post("/login", loginValidator, login);

authRouter.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully", success: true });
});

authRouter.get('/get-me', authUser, getMe)

export default authRouter;