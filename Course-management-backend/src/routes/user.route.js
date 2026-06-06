const controller = require('../controller/user.control.js');
const express = require('express');
const router = express.Router();
const checkToken = require('../middlewares/checktoken.js');
const allowedto = require('../middlewares/allowedto.js');
const roles = require('../utils/userRoles.js');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) { 
        const filetype = file.mimetype.split('/')[1];
        cb(null, `user-${Date.now()}.${filetype}`);

    }

});
const fileFilter = (req, file, cb) => {
    const filetype = file.mimetype.split('/')[0];
    if (filetype === 'image') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};
const filter = multer({ storage: storage, fileFilter: fileFilter });







router.route('/users')
    .get(checkToken,
        allowedto(roles.ADMIN,roles.INSTRUCTOR), 
        controller.getusers);
router.route('/users/profile')
    .get(checkToken, controller.profile);
router.route('/users/profile/update')
    .patch(checkToken, filter.single('avatar'), controller.updateprofile);
module.exports = router;