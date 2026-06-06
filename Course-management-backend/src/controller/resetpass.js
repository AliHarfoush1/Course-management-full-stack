const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");

const sendEmail = require("../utils/sendemail");
const asyncwrapper = require("../middlewares/middlewares.js");


const AppError = require("../utils/apperror");
const resetPassword = asyncwrapper(async (req, res, next) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
        return next(new AppError("Password and confirm password are required", 400));
    }

    if (password !== confirmPassword) {
        return next(new AppError("Passwords do not match", 400));
    }

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        return next(new AppError("Token is invalid or has expired", 400));
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined;

    await user.save();

    res.status(200).json({
        status: "success",
        message: "Password reset successfully"
    });
});
module.exports = {
    resetPassword
};