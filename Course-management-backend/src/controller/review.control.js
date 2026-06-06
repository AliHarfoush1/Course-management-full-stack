const Review = require("../models/review.model");
const Course = require("../models/course.model");
const AppError = require("../utils/apperror");
const asyncwrapper = require("../middlewares/middlewares.js");
const jwt = require('jsonwebtoken');

const addreview = asyncwrapper(async (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decoded.id;

    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
        throw new AppError("Course not found", 404);
    }
    const existingReview = await Review.findOne({ user: userId, course: courseId });
    if (existingReview) {
        throw new AppError("You have already reviewed this course", 400);
    }
    const review = new Review({
        user: userId,
        course: courseId,
        rating: rating,
        comment: comment
    });
    await review.save();

    const populatedReview = await Review.findById(review._id)
        .populate("user", "firstName lastName")
        .populate("course", "name");

    res.status(201).json({
        status: "success",
        data: {
            _id: populatedReview._id,
            rating: populatedReview.rating,
            comment: populatedReview.comment,
            Timestamp: populatedReview.Timestamp,
            userName: populatedReview.user.firstName + " " + populatedReview.user.lastName,
            courseName: populatedReview.course.name
        }
    });
});

const getreviews = asyncwrapper(async (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decoded.id;
    const { courseId } = req.params;

    const reviews = await Review.find({ course: courseId })
        .populate("user", "firstName lastName")
        .populate("course", "name");

    const formattedReviews = reviews.map(review => ({
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        Timestamp: review.Timestamp,
        userName: review.user.firstName + " " + review.user.lastName,
        courseName: review.course.name
    }));

    res.status(200).json({
        status: "success",
        data: formattedReviews
    });
});

const updatereview = asyncwrapper(async (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decoded.id;
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({ user: userId, course: courseId });
    if (!review) {
        throw new AppError("Review not found", 404);
    }
    review.rating = rating;
    review.comment = comment;
    await review.save();
    // populate review to connect the models

    const populatedReview = await Review.findById(review._id)
        .populate("user", "firstName lastName")
        .populate("course", "name");

    res.status(200).json({
        status: "success",
        data: {
            courseName: populatedReview.course.name,
            userName: populatedReview.user.firstName + " " + populatedReview.user.lastName,
            rating: populatedReview.rating,
            comment: populatedReview.comment,
            Timestamp: populatedReview.Timestamp,
            _id: populatedReview._id,
        }
    });
});

const deletereview = asyncwrapper(async (req, res, next) => {
    const token = req.cookies.accessToken || req.headers.authorization?.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const userId = decoded.id;
    const { courseId } = req.params;

    const review = await Review.findOne({ user: userId, course: courseId });
    if (!review) {
        throw new AppError("Review not found", 404);
    }

    await review.deleteOne();

    res.status(200).json({
        status: "success",
        message: "Review deleted successfully"
    });
});

module.exports = {
    addreview,
    getreviews,
    updatereview,
    deletereview
};
