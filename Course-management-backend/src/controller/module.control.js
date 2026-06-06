const mongoose = require("mongoose");
const Module = require("../models/module.model");
const Course = require("../models/course.model");
const Lesson = require("../models/lesson.model");
const asyncwrapper = require("../middlewares/middlewares.js");
const AppError = require("../utils/apperror");

const addModule = asyncwrapper(async (req, res, next) => {
    const { courseId } = req.params;
    const { title, order } = req.body;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return next(new AppError("Invalid course id", 400));
    }

    if (!title) {
        return next(new AppError("Module title is required", 400));
    }

    const course = await Course.findById(courseId);

    if (!course) {
        return next(new AppError("Course not found", 404));
    }

    const userId = req.userId || req.user.id;

    

    const module = await Module.create({
        title,
        course: courseId,
        order

    });

    res.status(201).json({
        status: "success",
        message: "Module added successfully",
        data: {
            module
        }
    });
});

const getCourseModules = asyncwrapper(async (req, res, next) => {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return next(new AppError("Invalid course id", 400));
    }

    const course = await Course.findById(courseId);

    if (!course) {
        return next(new AppError("Course not found", 404));
    }

    const modules = await Module.find({ course: courseId })
        .sort("order")
        .select("-__v");

    res.status(200).json({
        status: "success",
        results: modules.length,
        data: {
            modules
        }
    });
});

const getCourseContent = asyncwrapper(async (req, res, next) => {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return next(new AppError("Invalid course id", 400));
    }

    const course = await Course.findById(courseId);

    if (!course) {
        return next(new AppError("Course not found", 404));
    }

    const modules = await Module.find({ course: courseId })
        .sort("order")
        .lean();

    const lessons = await Lesson.find({ course: courseId })
        .sort("order")
        .lean();

    const modulesWithLessons = modules.map((module) => {
        return {
            ...module,
            lessons: lessons.filter(
                (lesson) => lesson.module.toString() === module._id.toString()
            )
        };
    });

    res.status(200).json({
        status: "success",
        data: {
            course: {
                id: course._id,
                name: course.name,
                description: course.description,
                price: course.price,
                avatar: course.avatar
            },
            modules: modulesWithLessons
        }
    });
});

const updateModule = asyncwrapper(async (req, res, next) => {
    const { moduleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
        return next(new AppError("Invalid module id", 400));
    }

    const module = await Module.findById(moduleId);

    if (!module) {
        return next(new AppError("Module not found", 404));
    }

    const userId = req.userId || req.user.id;

   

    const allowedFields = ["title", "description", "order"];

    const updateData = {};

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            updateData[field] = req.body[field];
        }
    });

    const updatedModule = await Module.findByIdAndUpdate(
        moduleId,
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

    res.status(200).json({
        status: "success",
        message: "Module updated successfully",
        data: {
            module: updatedModule
        }
    });
});

const deleteModule = asyncwrapper(async (req, res, next) => {
    const { moduleId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(moduleId)) {
        return next(new AppError("Invalid module id", 400));
    }

    const module = await Module.findById(moduleId);

    if (!module) {
        return next(new AppError("Module not found", 404));
    }

    const userId = req.userId || req.user.id;


    await Lesson.deleteMany({ module: moduleId });

    await Module.findByIdAndDelete(moduleId);

    res.status(200).json({
        status: "success",
        message: "Module and its lessons deleted successfully"
    });
});

module.exports = {
    addModule,
    getCourseModules,
    getCourseContent,
    updateModule,
    deleteModule
};