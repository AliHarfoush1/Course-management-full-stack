const crypto = require("crypto");
const asyncwrapper = require("../middlewares/middlewares.js");
const User = require("../models/user.model");
const AppError = require("../utils/apperror.js");
const verifyEmail = asyncwrapper(async (req, res, next) => {
    const { token } = req.params;
//
console.log("Received verification token:", token);
    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpires: { $gt: new Date() }
    });
    console.log("expires" ,user?.emailVerificationTokenExpires);

    if (!user) {
        return next(new AppError("Verification token is invalid or has expired", 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: "success",
        message: "Email verified successfully. You can now login."
    });
});
module.exports = {
    verifyEmail
};