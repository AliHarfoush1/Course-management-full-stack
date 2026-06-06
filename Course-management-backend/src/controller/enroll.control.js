const userModel = require('../models/user.model.js');
const courseModel = require('../models/course.model.js');
const enrollModel = require('../models/enrollment.js');
const asyncwrapper = require('../middlewares/middlewares.js');
const ErrorHandler = require('../utils/apperror.js');

const jwt = require('jsonwebtoken');
const enrollInCourse = asyncwrapper(async (req, res, next) => {
    const courseId = req.params.id;
    let userId = req.userId || req.user.id;
    if (req.user && req.user.role === 'ADMIN' && req.body.userId) {
        userId = req.body.userId;
    }
    const course = await courseModel.findById(courseId);
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }
    const user = await userModel.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    if (user.enrolledCourses.includes(courseId)) {
        return next(new ErrorHandler("Already enrolled in this course", 400));
    }
    user.enrolledCourses.push(courseId);
    await user.save();
    course.studentsEnrolled.push(userId);
    await course.save();
    const enrollment = new enrollModel({
        user: userId,
        course: courseId
    });
    await enrollment.save();
    res.status(200).json({ status: "success",
         message: "Enrolled in course successfully" });
});


const unenrollFromCourse = asyncwrapper(async (req, res, next) => {
    const courseId = req.params.id;
   
    let userId = req.userId || req.user.id;
    if (req.user && req.user.role === 'ADMIN' && (req.body.userId || req.query.userId)) {
        userId = req.body.userId || req.query.userId;
    }
    const course = await courseModel.findById(courseId);
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }
    const user = await userModel.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    if (!user.enrolledCourses.includes(courseId)) {
        return next(new ErrorHandler("Not enrolled in this course", 400));
    }
    user.enrolledCourses.pull(courseId);
    await user.save();
    course.studentsEnrolled.pull(userId);
    await course.save();
    const enrollment = await enrollModel.findOneAndDelete({
        user: userId,
        course: courseId
    });
    if (!enrollment) {
        return next(new ErrorHandler("Enrollment not found", 404));
    }
    res.status(200).json({ status: "success",
         message: "Unenrolled from course successfully" });
});


const getMyCourses = asyncwrapper(async (req, res, next) => {
    const userId = req.userId || req.user.id;
    const user = await userModel.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    founduser = await userModel
    .findById(user)
    .populate({
        path: "enrolledCourses",
        select: "name description price avatar instructor",
        populate: {
            path: "instructor",
            select: "firstName lastName -_id"
        }
    });
   
    res.status(200).json({ status: "success",
         data: founduser.enrolledCourses });
});


const getCourseStudents = asyncwrapper(async (req, res, next) => {
    const courseId = req.params.id;
    const course = await courseModel.findById(courseId);  
    if (!course) {
        return next(new ErrorHandler("Course not found", 404));
    }
    const students = await courseModel
    .findById(courseId)
    .populate({
        path: "studentsEnrolled",
        select: "firstName lastName email"
    });

    res.status(200).json({ status: "success",
         data: students.studentsEnrolled });
});
module.exports = {
    enrollInCourse,
    unenrollFromCourse,
    getMyCourses,
    getCourseStudents
};