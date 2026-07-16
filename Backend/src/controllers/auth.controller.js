import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";
import crypto from "crypto";

export async function register(req, res) {
    const { username, email, password } = req.body;
    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ email }, { username }]
    });
    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "User with this email or username already exists",
            success: false,
            err: "User already exists"
        });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes

    const user = await userModel.create({
        username,
        email,
        password,
        isVerified: false,
        verified: false,
        verificationToken: tokenHash,
        verificationTokenExpires: tokenExpiry
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verificationUrl = `${clientUrl}/verify-email?token=${rawToken}`;
    console.log("[DEV ONLY] Verification URL:", verificationUrl);

    let emailSent = false;
    let message = "We've sent a verification email to your email address.";

    try {
        await sendEmail({
            to: email,
            subject: "Verify Your Email - Perplexity",
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Email</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; color: #333333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #00D26A; letter-spacing: -0.5px; }
        .content { line-height: 1.6; font-size: 16px; margin-bottom: 30px; }
        .button-wrapper { text-align: center; margin: 30px 0; }
        .button { background-color: #00D26A; color: #020617 !important; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; }
        .fallback { font-size: 12px; color: #666666; word-break: break-all; margin-top: 20px; }
        .footer { font-size: 12px; text-align: center; color: #999999; margin-top: 40px; border-top: 1px solid #eeeeee; padding-top: 20px; }
    </style>
</head>
<body>
    <div style="background-color: #f9f9f9; padding: 40px 0;">
        <div class="container">
            <div class="header">
                <span class="logo">Perplexity</span>
            </div>
            <div class="content">
                <p>Hello <strong>${username}</strong>,</p>
                <p>Thank you for registering at <strong>Perplexity</strong>! To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
                <div class="button-wrapper">
                    <a href="${verificationUrl}" class="button">Verify Email</a>
                </div>
                <p>Please note that this verification link will expire in <strong>30 minutes</strong>.</p>
                <p>If the button above does not work, copy and paste the following link into your browser:</p>
                <p class="fallback"><a href="${verificationUrl}">${verificationUrl}</a></p>
            </div>
            <div class="footer">
                <p>If you did not sign up for this account, you can safely ignore this email.</p>
                <p>Best regards,<br>The Perplexity Team</p>
            </div>
        </div>
    </div>
</body>
</html>
            `
        });
        emailSent = true;
    } catch (mailError) {
        console.error("Failed to send verification email during registration:", mailError);
        message = "Account created successfully, but we could not send the verification email. Please use the resend verification option.";
    }

    res.status(201).json({
        message,
        success: true,
        emailSent,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

export async function login(req, res) {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({
            message: "Invalid email and password",
            success: false,
            err: "Invalid credentials"
        });
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return res.status(400).json({
            message: "Invalid email and password",
            success: false,
            err: "Invalid credentials"
        });
    }

    if (user.isVerified === false) {
        return res.status(400).json({
            message: "Please verify your email before logging in.",
            success: false,
            err: "Email not verified"
        });
    }

    const token = jwt.sign({
        id: user._id,
        username: user.username,
    }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie("token", token);

    res.status(200).json({
        message: "User logged in successfully",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        });
    }

    res.status(200).json({
        message: "user details fetched successfully",
        success: true,
        user
    });
}

export async function verifyEmail(req, res) {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "Verification token is required"
        });
    }

    try {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        const user = await userModel.findOne({ verificationToken: tokenHash });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification token"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        if (user.verificationTokenExpires && user.verificationTokenExpires < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "Verification token has expired"
            });
        }

        user.isVerified = true;
        user.verified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        const jwtToken = jwt.sign({
            id: user._id,
            username: user.username,
        }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie("token", jwtToken);

        return res.status(200).json({
            success: true,
            message: "Email verified successfully and logged in",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server error during verification",
            err: err.message
        });
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
        if (user.isVerified || user.verified) {
            return res.status(400).json({
                message: "This email is already verified",
                success: false
            });
        }
        
        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        
        user.verificationToken = tokenHash;
        user.verificationTokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
        
        const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
        const verificationUrl = `${clientUrl}/verify-email?token=${rawToken}`;
        console.log("[DEV ONLY] Verification URL (Resend):", verificationUrl);

        try {
            await sendEmail({
                to: email,
                subject: "Verify Your Email - Perplexity",
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verify Your Email</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; color: #333333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #00D26A; letter-spacing: -0.5px; }
        .content { line-height: 1.6; font-size: 16px; margin-bottom: 30px; }
        .button-wrapper { text-align: center; margin: 30px 0; }
        .button { background-color: #00D26A; color: #020617 !important; text-decoration: none; padding: 12px 30px; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; }
        .fallback { font-size: 12px; color: #666666; word-break: break-all; margin-top: 20px; }
        .footer { font-size: 12px; text-align: center; color: #999999; margin-top: 40px; border-top: 1px solid #eeeeee; padding-top: 20px; }
    </style>
</head>
<body>
    <div style="background-color: #f9f9f9; padding: 40px 0;">
        <div class="container">
            <div class="header">
                <span class="logo">Perplexity</span>
            </div>
            <div class="content">
                <p>Hello <strong>${user.username}</strong>,</p>
                <p>You requested a new verification link. Please verify your email address by clicking the button below:</p>
                <div class="button-wrapper">
                    <a href="${verificationUrl}" class="button">Verify Email</a>
                </div>
                <p>Please note that this verification link will expire in <strong>30 minutes</strong>.</p>
                <p>If the button above does not work, copy and paste the following link into your browser:</p>
                <p class="fallback"><a href="${verificationUrl}">${verificationUrl}</a></p>
            </div>
            <div class="footer">
                <p>If you did not request this, you can safely ignore this email.</p>
                <p>Best regards,<br>The Perplexity Team</p>
            </div>
        </div>
    </div>
</body>
</html>
                `
            });
        } catch (mailError) {
            console.error("Failed to send verification email during resend:", mailError);
            return res.status(500).json({
                message: "Failed to send verification email. Please try again.",
                success: false,
                err: mailError.message || "Resend failure"
            });
        }

        await user.save();

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
