const mongoose = require("mongoose");
const Lesson = require("../models/lesson.model");
const Module = require("../models/module.model");
const Course = require("../models/course.model");
const Enrollment = require("../models/enrollment.js");
const asyncwrapper = require("../middlewares/middlewares.js");
const AppError = require("../utils/apperror");

const addLesson = asyncwrapper(async (req, res, next) => {
    const { moduleId } = req.params;
    const module = await Module.findById(moduleId);

    if (!module) {
        return next(new AppError("Module not found", 404));
    }


    const { title, description, content, videoUrl, order, isPreview } = req.body;

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
        return next(new AppError("Invalid module id", 400));
    }

    if (!title) {
        return next(new AppError("Lesson title is required", 400));
    }

    if (!content && !videoUrl) {
        return next(new AppError("Lesson content or video URL is required", 400));
    }


    const course = await Course.findById(module.course);

    if (!course) {
        return next(new AppError("Course not found", 404));
    }

    const userId = req.userId || req.user.id;


    const lesson = await Lesson.create({
        title,
        description,
        content,
        videoUrl,
        order,
        isPreview,
        module: moduleId,
        course: module.course,
        instructor: userId
    });

    res.status(201).json({
        status: "success",
        message: "Lesson added successfully",
        data: {
            lesson
        }
    });
});

const getModuleLessons = asyncwrapper(async (req, res, next) => {
    const { moduleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
        return next(new AppError("Invalid module id", 400));
    }

    const module = await Module.findById(moduleId);

    if (!module) {
        return next(new AppError("Module not found", 404));
    }

    const lessons = await Lesson.find({ module: moduleId })
        .sort("order")
        .select("-__v");

    res.status(200).json({
        status: "success",
        results: lessons.length,
        data: {
            lessons
        }
    });
});

const getLessonById = asyncwrapper(async (req, res, next) => {
    const { lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
        return next(new AppError("Invalid lesson id", 400));
    }

    const lesson = await Lesson.findById(lessonId)
        .populate("course", "name price instructor")
        .populate("module", "title order")
        .select("-__v");

    if (!lesson) {
        return next(new AppError("Lesson not found", 404));
    }

    const userId = req.userId || req.user?.id;

    if (lesson.isPreview) {
        return res.status(200).json({
            status: "success",
            data: {
                lesson
            }
        });
    }

    if (!userId) {
        return next(new AppError("You must login to view this lesson", 401));
    }

    if (req.user.role === "ADMIN") {
        return res.status(200).json({
            status: "success",
            data: {
                lesson
            }
        });
    }

    if (
        req.user.role === "INSTRUCTOR" &&
        lesson.instructor.toString() === userId.toString()
    ) {
        return res.status(200).json({
            status: "success",
            data: {
                lesson
            }
        });
    }

    const enrollment = await Enrollment.findOne({
        student: userId,
        course: lesson.course._id
    });

    if (!enrollment) {
        return next(new AppError("You must enroll in this course to view this lesson", 403));
    }

    res.status(200).json({
        status: "success",
        data: {
            lesson
        }
    });
});

const updateLesson = asyncwrapper(async (req, res, next) => {
    const { lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
        return next(new AppError("Invalid lesson id", 400));
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
        return next(new AppError("Lesson not found", 404));
    }

    const userId = req.userId || req.user.id;

   

    const allowedFields = [
        "title",
        "description",
        "content",
        "video_url",
        "order",
        "isPreview"
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    const updatedLesson = await Lesson.findByIdAndUpdate(
        lessonId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: "success",
        message: "Lesson updated successfully",
        data: {
            lesson: updatedLesson
        }
    });
});

const deleteLesson = asyncwrapper(async (req, res, next) => {
    const { lessonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(lessonId)) {
        return next(new AppError("Invalid lesson id", 400));
    }

    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
        return next(new AppError("Lesson not found", 404));
    }

    const userId = req.userId || req.user.id;

    if (
        req.user.role !== "ADMIN" &&
        lesson.instructor.toString() !== userId.toString()
    ) {
        return next(new AppError("You are not allowed to delete this lesson", 403));
    }

    await Lesson.findByIdAndDelete(lessonId);

    res.status(200).json({
        status: "success",
        message: "Lesson deleted successfully"
    });
});

module.exports = {
    addLesson,
    getModuleLessons,
    getLessonById,
    updateLesson,
    deleteLesson
};