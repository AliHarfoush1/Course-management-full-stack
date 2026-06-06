const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    let token;

    // 1) لو التوكن موجود في cookies
    if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken;
    }

    // 2) لو التوكن موجود في Authorization header
    else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer ')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

        req.user = decoded;
        req.userId = decoded.id;

        next();
    } catch (err) {
        return res.status(401).json({
            status: 'error',
            message: 'Invalid or expired access token.'
        });
    }
};