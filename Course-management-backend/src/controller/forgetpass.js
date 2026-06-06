const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const AppError = require("../utils/apperror");
const sendEmail = require("../utils/sendemail");
const asyncwrapper = require("../middlewares/middlewares.js");

const forgetPassword = asyncwrapper(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError("Email is required", 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError("No user found with this email", 404));
    }

    const resetToken = user.createPasswordResetToken();
    
    await user.save({ validateBeforeSave: false });

    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `Forgot your password? Reset it by opening this link: ${resetURL}
If you did not forget your password, ignore this email.`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Your password reset token valid for 10 minutes",
            message
        });

        res.status(200).json({
            status: "success",
            message: "Token sent to email"
        });
    }  catch (err) {
    console.log("EMAIL ERROR:", err);

    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError("There was an error sending the email", 500));
}
});
module.exports = {
    forgetPassword
};