const mongoose = require('mongoose');
const User = require('../models/user.model.js');
const status = require('../utils/status.js');
const asyncwrapper = require('../middlewares/middlewares.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/apperror.js');
const getusers = asyncwrapper(async (req, res) => {
    const users = await User.find({}, { password: 0, refreshToken: 0, __v: 0 });

    res.json({
        status: status.SUCCESS,
        data: users
    });
});

const profile = asyncwrapper(async (req, res) => {
   const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

const userId = decoded.id;


const user = await User.findById(userId, { password: 0, refreshToken: 0, __v: 0 });

res.json({
    status: status.SUCCESS,
    data: user
});
});

const updateprofile = asyncwrapper(async (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

const userId = decoded.id;

const allowedFields = ["firstName", "lastName"];

    const updateData = {};

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    if (req.file) {
        updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
        userId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    ).select("-password -refreshToken");

    if (!user) {
        return next(new AppError("User not found", 404));
    }

    res.status(200).json({
        status: "success",
        message: "Profile updated successfully",
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

module.exports = {
    getusers,
    profile,
    updateprofile
};