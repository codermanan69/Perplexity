import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";

export async function register(req, res) {
    const { username, email, password } = req.body;
    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ email }, { username }]
    })
    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User with this email or username already exists",
            success: false,
            err: "User already exists"
        })

    }


    const user = await userModel.create({ username, email, password })

    const emailVerificationToken = jwt.sign({
        email: user.email,
    }, process.env.JWT_SECRET)



    try {
        await sendEmail({
            to: email,
            subject: "Welcome to Perplexity!",
            html: `
                    <p>Hi ${username},</p>
                    <p>Thank you for registering at <strong>Perplexity</strong>. We're excited to have you on board!</p>
                    <p>Please verify your email address by clicking the link below:</p>
                    <a href="${process.env.API_URL || 'http://localhost:3000/api'}/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
                    <p>If you did not create an account, please ignore this email.</p>
                    <p>Best regards,<br>The Perplexity Team</p>
            `
        });
    } catch (mailError) {
        console.error("Failed to send welcome/verification email:", mailError.message || mailError);
    }
    res.status(201).json({
        message: "User registered successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });


}

export async function login(req, res) {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email and password",
            success: false,
            err: "Invalid credentials"
        })
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return res.status(400).json({
            message: "Invalid email and password",
            success: false,
            err: "Invalid credentials"
        })
    }

    if (!user.verified) {
        return res.status(400).json({
            message: "Please verify your email",
            success: false,
            err: "Email not verified"
        })
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
    }, process.env.JWT_SECRET, { expiresIn: '7d' })

    res.cookie("token", token)

    res.status(200).json({
        message: "User logged in successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}

export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "user details fetched successfully",
        success: true,
        user
    })

}


export async function verifyEmail(req, res) {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?success=false&error=${encodeURIComponent("User not found")}`);
        }

        user.verified = true;
        await user.save();

        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?success=true`);
    } catch (err) {
        return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?success=false&error=${encodeURIComponent(err.message)}`);
    }
}

export async function resendVerification(req, res) {
    const { email } = req.body;
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found with this email",
                success: false
            });
        }
        if (user.verified) {
            return res.status(400).json({
                message: "This email is already verified",
                success: false
            });
        }
        
        const emailVerificationToken = jwt.sign({
            email: user.email,
        }, process.env.JWT_SECRET);

        await sendEmail({
            to: email,
            subject: "Welcome to Perplexity!",
            html: `
                <p>Hi ${user.username},</p>
                <p>Thank you for registering at <strong>Perplexity</strong>. We're excited to have you on board!</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${process.env.API_URL || 'http://localhost:3000/api'}/auth/verify-email?token=${emailVerificationToken}">Verify Email</a>
                <p>If you did not create an account, please ignore this email.</p>
                <p>Best regards,<br>The Perplexity Team</p>
            `
        });

        return res.status(200).json({
            message: "Verification email resent successfully",
            success: true
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to resend verification email",
            success: false,
            err: err.message
        });
    }
}


