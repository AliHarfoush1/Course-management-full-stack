const express = require('express');
const router = express.Router();
const controller = require('../controller/auth.control.js');
const checkToken = require('../middlewares/checktoken.js');
const multer = require('multer');
const allowedto = require('../middlewares/allowedto.js');
const upload = multer({ dest: 'uploads/' });
const resetPassword = require("../controller/resetpass.js").resetPassword;
const forgetPassword= require("../controller/forgetpass.js").forgetPassword;
const verifyEmail = require("../controller/verifyemail.js").verifyEmail;
const roles = require('../utils/userRoles.js');
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


router.route('/register')
    .post(filter.single('avatar'), controller.postuser);
router.route('/login')
    .post(controller.loginuser);
router.route('/refresh-token')
    .post( controller.refreshAccessToken);
router.route('/logout')
    .post(checkToken, controller.logoutUser);
router.patch(
    "/users/:id/role",
    checkToken,
    allowedto("ADMIN"),
   controller.updateUserRole
);

router.post("/forget-password", forgetPassword);
router.patch("/reset-password/:token", resetPassword);

router.post ('/resend-verification-email', controller.resendVerificationEmail);
router.get('/verify-email/:token', verifyEmail);
module.exports = router;