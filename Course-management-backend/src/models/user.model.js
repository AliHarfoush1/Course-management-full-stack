const mongoose = require('mongoose');
const validator = require('validator');
const course= require('./course.model.js');
const userSchema = new mongoose.Schema({
  firstName: {
    type: String, required: true
},lastName: {
    type: String, required: true
},email: {
    type: String,
     required: true, 
     unique: true,
     validate:[  validator.isEmail,
       'Please enter a valid email'] ,
    lowercase: true,
    trim: true,
    index: true
    
    
},password: {
    type: String, 
    required: true,
    select: false,
    minlength: [8, 'Password must be at least 8 characters long']
},
enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
}],
tokens: 
    {
         type: String,
          required: false 
    },
refreshToken: {
    type: String,
     required: false
},
role: {
    type: String,
     required: true,
    enum: ["STUDENT", "ADMIN", "INSTRUCTOR"],
    default: "STUDENT"},
avatar: {
    type: String,
    default: "/uploads/profile.jpg",
    required: false
},
createdAt: {
    type: Date,
    default: Date.now   },
passwordResetToken: String,


passwordResetExpires: Date,
emailVerificationToken: String,
isEmailVerified: {
    type: Boolean,
    default: false},
emailVerificationTokenExpires: Date,

});
const crypto = require("crypto");

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};


userSchema.methods.createEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString("hex");

    this.emailVerificationToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

this.emailVerificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    return verificationToken;
};
const User = mongoose.model('User', userSchema);
module.exports = User;