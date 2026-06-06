const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
    

    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    logger.error({
        message: err.message,
        stack: err.stack,
        url: req.originalUrl,
        method: req.method
    });

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message
    });
};

module.exports = errorHandler;