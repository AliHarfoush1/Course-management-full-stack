const mongoose = require('mongoose');
const Course = require('../models/course.model.js');
const status = require('../utils/status.js');
const asyncwrapper = require('../middlewares/middlewares.js');
const AppError = require('../utils/apperror.js');
const getcourses = asyncwrapper(async (req, res) => {
    const {
        search,
        minPrice,
        maxPrice,
        sort
    } = req.query;

    const queryObj = {};

    // Search by course name or description
    if (search) {
        queryObj.$or = [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    // Filter by price
    if (minPrice || maxPrice) {
        queryObj.price = {};

        if (minPrice) {
            queryObj.price.$gte = Number(minPrice);
        }

        if (maxPrice) {
            queryObj.price.$lte = Number(maxPrice);
        }
    }

    

    let coursesQuery = Course.find(queryObj, { __v: 0 })
        

    // Sort
    if (sort) {
        coursesQuery = coursesQuery.sort(sort);
    } else {
        coursesQuery = coursesQuery.sort("-createdAt");
    }

    const courses = await coursesQuery;

    const formattedCourses = courses.map(course => ({
        id: course._id,
        name: course.name,
        description: course.description,
        price: course.price,
        avatar: course.avatar
    }));

    res.json({
        status: status.SUCCESS,
        results: formattedCourses.length,
        data: formattedCourses
    });
});

const postcourse = asyncwrapper(async (req, res, next) => {
    const newCourse = new Course({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        avatar: req.body.avatar || "/uploads/profile.jpg",
        instructor: req.user.id
    });

    await newCourse.save();

    res.status(201).json({
        status: status.SUCCESS,
        data: {
            id: newCourse._id,
            name: newCourse.name,
            description: newCourse.description,
            price: newCourse.price,
            avatar: newCourse.avatar,
            instructor: newCourse.instructor
        }
    });
});

const getCoursesById = asyncwrapper(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid course id", 400));
    }

    const foundCourse = await Course.findById(id)
        .populate("instructor", "firstName lastName -_id");

    if (!foundCourse) {
        return next(new AppError("Course not found", 404));
    }

    res.json({
        status: status.SUCCESS,
        data: {
            id: foundCourse._id,
            name: foundCourse.name,
            description: foundCourse.description,
            price: foundCourse.price,
            avatar: foundCourse.avatar,
            instructor: foundCourse.instructor
                ? `${foundCourse.instructor.firstName} ${foundCourse.instructor.lastName}`
                : "No instructor assigned",
            students: foundCourse.students
        }
    });
});
const deletecourse = asyncwrapper(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid course id", 400));
    }

    const foundCourse = await Course.findById(id);

    if (!foundCourse) {
        return next(new AppError("Course not found", 404));
    }
    

    await foundCourse.deleteOne();
    await Review.deleteMany({ course: id });
    res.json({
        status: status.SUCCESS,
        message: "Course deleted successfully"
    });
});

const updateCourse = asyncwrapper(async (req, res,next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid course id", 400));
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedCourse) {
        return next(new AppError("Course not found", 404));
    }

   res.status(200).json({
    status: "success",
    data: {
        id: updatedCourse._id,
        name: updatedCourse.name,
        price: updatedCourse.price
    }
});
});
const uploadCourseCover = asyncwrapper(async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(new AppError("Invalid course id", 400));
    }

    const updatedCourse = await Course.findByIdAndUpdate(
        id,
        { avatar: req.file ? req.file.filename : "/uploads/profile.jpg" },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedCourse) {
        return next(new AppError("Course not found", 404));
    }

    res.json({
        status: status.SUCCESS,
        data: updatedCourse
    });
});

module.exports = {
    getcourses,
    postcourse,
    getCoursesById,
    deletecourse,
    updateCourse,
    uploadCourseCover}
;