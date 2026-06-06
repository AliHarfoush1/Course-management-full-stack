const express = require('express');
const router = express.Router();
const moduleController = require('../controller/module.control.js');
const lessonController = require('../controller/lesson.control.js');
const verifyToken = require('../middlewares/checktoken.js');
const allowedto  = require('../middlewares/allowedto.js');
const roles = require('../utils/userRoles.js');
//module routes
router.route('/:courseId/modules')
    .get(moduleController.getCourseModules)
    .post(verifyToken, allowedto( roles.ADMIN, roles.INSTRUCTOR ), moduleController.addModule);
router.route('/:courseId/content')
    .get(moduleController.getCourseContent);
router.route('/modules/:moduleId')
    .patch(verifyToken, allowedto( roles.ADMIN, roles.INSTRUCTOR ), moduleController.updateModule)
    .delete(verifyToken, allowedto( roles.ADMIN, roles.INSTRUCTOR ), moduleController.deleteModule);

    //lesson routes
router.route('/:moduleId/lessons')
    .get(verifyToken, allowedto( roles.ADMIN, roles.INSTRUCTOR, roles.STUDENT ), lessonController.getModuleLessons)
    .post(verifyToken, allowedto( roles.ADMIN, roles.INSTRUCTOR ), lessonController.addLesson);
router.route('/lessons/:lessonId')
    .get(verifyToken, allowedto( roles.ADMIN, roles.INSTRUCTOR, roles.STUDENT ), lessonController.getLessonById)
    .patch(verifyToken, allowedto( roles.ADMIN, roles.INSTRUCTOR ), lessonController.updateLesson)
    .delete(verifyToken, allowedto( roles.ADMIN, roles.INSTRUCTOR ), lessonController.deleteLesson);

module.exports = router;