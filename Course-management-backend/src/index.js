const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const errorMiddleware = require('./middlewares/error_middleware.js');
const courseRouter = require('./routes/course.route.js');
const authRouter = require('./routes/auth.route.js');
const userRouter=require('./routes/user.route.js');
const contentRouter = require('./routes/content.route.js');
const reviewRouter = require('./routes/review.route.js');
const path = require('path');
const app = express();
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const morgan = require("morgan");

//logging middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(helmet());
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("MongoDB connection error:", err.message);
    });
// Apply rate limiting to all requests
const limiter = rateLimit({
    max: 1000,
    windowMs: 15 * 60 * 1000,
    message: {
        status: "error",
        message: "Too many requests, please try again later"
    }
});

app.use(limiter);
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Prevent HTTP parameter pollution
app.use(hpp());

app.use(cookieParser());
app.use('/api/courses', courseRouter);
app.use('/api', authRouter);
app.use('/api', userRouter);
app.use('/api', reviewRouter);
app.use('/api/courses', contentRouter);
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from the uploads directory

// Error middleware لازم يكون آخر حاجة
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});