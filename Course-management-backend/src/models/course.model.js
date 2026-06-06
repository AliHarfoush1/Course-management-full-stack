const mongoose = require('mongoose');
const courseSchema = new mongoose.Schema({
  name: {
    type: String,
     required: true,
     index: true
},
description: {
    type: String, required: true
},
  price: {
    type: Number, 
    required: true,
    min:[0, 'Price must be a positive number'],
    index: true
  },avatar: {
    type: String,
    default: "/uploads/profile.jpg",
    required: false
},
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentsEnrolled: [{
    type:mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
},
{
  timestamps: true
}
);
const Course = mongoose.model('Course', courseSchema);
module.exports = Course;