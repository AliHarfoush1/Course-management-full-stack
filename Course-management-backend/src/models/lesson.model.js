const mongoose = require('mongoose');
const moduleModel = require('./module.model');
const courseModel = require('./course.model');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    content: {
        type: String,
        default: ''
    },
    video_url: {
        type: String,
        trim: true,
        default: ''
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    order: {
        type: Number,
        default: 1
    },
    is_previewed: {
        type: Boolean,
        default: false
    }
});
const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;