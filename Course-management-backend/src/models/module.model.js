const courseModel = require('./course.model');
const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'},
    order: {
        type: Number,
        default: 1

    }},
    {
        timestamps: true
    }
);
const Module = mongoose.model('Module', moduleSchema);
module.exports = Module;