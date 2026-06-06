const express = require('express');
const router = express.Router();
const controller = require('../controller/review.control.js');
const checkToken = require('../middlewares/checktoken.js');
const allowedto = require('../middlewares/allowedto.js');
const roles = require('../utils/userRoles.js');
router.route('/courses/:courseId/reviews')
    .post(checkToken,allowedto(roles.STUDENT), controller.addreview);
router.route('/courses/:courseId/reviews')
    .get(checkToken,allowedto(roles.STUDENT), controller.getreviews);
router.route('/courses/:courseId/reviews')
    .patch(checkToken,allowedto(roles.STUDENT), controller.updatereview);
router.route('/courses/:courseId/reviews')
    .delete(checkToken,allowedto(roles.STUDENT), controller.deletereview);
module.exports = router;