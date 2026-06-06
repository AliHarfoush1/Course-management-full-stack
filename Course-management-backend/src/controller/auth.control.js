const mongoose = require('mongoose');
const User = require('../models/user.model.js');
const status = require('../utils/status.js');
const asyncwrapper = require('../middlewares/middlewares.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/apperror.js');
const sendEmail = require('../utils/sendemail.js');
const {
    generateAccessToken,
    generateRefreshToken
} = require('../utils/generateJWT.js');



const postuser = asyncwrapper(async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;

    // 1) validation
    if (!firstName || !lastName || !email || !password) {
        return next(new AppError("All fields are required", 400));
    }

    if (password.length < 8) {
        return next(new AppError("Password must be at least 8 characters long", 400));
    }

    // 2) check old user
    const oldUser = await User.findOne({ email });

    if (oldUser) {
        return next(new AppError("Email already exists", 400));
    }

    // 3) hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4) create user object
    const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: "STUDENT",
        avatar: req.file ? `/uploads/${req.file.filename}` : "/uploads/profile.jpg"
    });

    // 5) create verification token
    const verificationToken = newUser.createEmailVerificationToken();

    // 6) save user with token fields
    await newUser.save();

    // 7) create verification URL
    const verificationURL = `http://localhost:5173/verify-email/${verificationToken}`;

    // 8) send email
    try {
        await sendEmail({
            email: newUser.email,
            subject: "Verify your email",
            message: `Welcome ${newUser.firstName},

Please verify your email by opening this link:

${verificationURL}

This link is valid for 15 minutes.`
        });

        res.status(201).json({
            status: "success",
            message: "User registered successfully. Please check your email to verify your account.",
            data: {
                user: {
                    id: newUser._id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    role: newUser.role,
                    avatar: newUser.avatar,
                    isEmailVerified: newUser.isEmailVerified
                }
            }
        });
    } catch (err) {
        await User.findByIdAndDelete(newUser._id);

        return next(new AppError("There was an error sending verification email. Please try again.", 500));
    }
});
const loginuser = asyncwrapper(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError("Email and password are required", 400));
    }
   
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return next(new AppError("Invalid email or password", 401));
    }
    if (!user.isEmailVerified) {
    return next(new AppError("Please verify your email before logging in", 403));
}
    const isPasswordValid = await bcrypt.compare(password, user.password);
   
    if (!isPasswordValid) {
        return next(new AppError("Invalid email or password", 401));
    }

  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role
};

const accessToken = generateAccessToken(payload);
const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save();
    res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 60 * 1000
});

res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
});

    res.json({
        status: status.SUCCESS,
        message: "Login successful",
        data: {
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
           
        }
    });
});

const refreshAccessToken = asyncwrapper(async (req, res, next) => {
    const { refreshToken } = req.cookies.refreshToken ? req.cookies : req.body;

    if (!refreshToken) {
        return next(new AppError("Refresh token is required", 400));
    }

    const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(decoded.id);

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    if (user.refreshToken !== refreshToken) {
        return next(new AppError("Invalid refresh token", 401));
    }

    const payload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role
    };

    const newAccessToken = generateAccessToken(payload);
      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 15 * 60 * 1000
    });
    res.status(200).json({
        status: status.SUCCESS,
        message: "Access token refreshed successfully"
        
    });
});
const logoutUser = asyncwrapper(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
        const user = await User.findOne({ refreshToken });

        if (user) {
            user.refreshToken = null;
            await user.save();
        }
    }

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });

    res.status(200).json({
        status: status.SUCCESS,
        message: "Logged out successfully"
    });
});
const updateUserRole = asyncwrapper(async (req, res, next) => {
    const userId = req.params.id;
    const { role } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        return next(new AppError("User not found", 404));
    }
const allowedRoles = ["STUDENT", "INSTRUCTOR", "ADMIN"];

if (!allowedRoles.includes(role)) {
    return next(new AppError("Invalid role", 400));
}
    user.role = role;
    await user.save();

    res.status(200).json({
        status: status.SUCCESS,
        message: "User role updated successfully",
        data: {
            user
        }
    });
});
const resendVerificationEmail = asyncwrapper(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError("Email is required", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError("No user found with this email", 404));
    }

    if (user.isEmailVerified) {
        return next(new AppError("Email is already verified", 400));
    }

    const verificationToken = user.createEmailVerificationToken();

    await user.save({ validateBeforeSave: false });

    const verificationURL = `http://localhost:5173/verify-email/${verificationToken}`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Verify your email",
            message: `Hello ${user.firstName},

Please verify your email by opening this link:

${verificationURL}

This link is valid for 15 minutes.`
        });

        res.status(200).json({
            status: "success",
            message: "Verification email sent successfully"
        });
    } catch (err) {
        user.emailVerificationToken = undefined;
        user.emailVerificationTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return next(new AppError("There was an error sending verification email", 500));
    }
});


module.exports = {
    postuser,
    loginuser,
    resendVerificationEmail,
    refreshAccessToken,
    logoutUser,
    updateUserRole
};