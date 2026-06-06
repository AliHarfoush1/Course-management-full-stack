const { Timestamp } = require('bson');
const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    courseName:{
        type: mongoose.Schema.Types.String,
        ref: 'Course',
        required: false
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: false
    },
    Timestamp: {
        type: Date,
        default: Date.now
    }
});
reviewSchema.index({ user: 1, course: 1 }, { unique: true });
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;