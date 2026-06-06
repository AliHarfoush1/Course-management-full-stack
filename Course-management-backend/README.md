# Course Management Backend API

A Node.js + Express + MongoDB backend for an e-learning/course management platform.

The system supports authentication, role-based access control, course management, enrollment, course content modules/lessons, reviews, password reset, email verification, file uploads, logging, and security middleware.

---

## Features

### Authentication & Authorization

- User registration
- User login
- JWT access token and refresh token
- Authentication using cookies and Authorization Bearer token
- Role-based access control
- Supported roles:
  - `STUDENT`
  - `INSTRUCTOR`
  - `ADMIN`
- Admin seed script for creating one admin account
- Logout
- Refresh access token
- Forgot password
- Reset password
- Email verification
- Resend verification email

### Users

- Get users
- Get logged-in user profile
- Update profile
- Upload profile avatar
- Admin can update user roles

### Courses

- Get all courses
- Search, filter, and sort courses
- Get single course by ID
- Create course
- Update course
- Delete course
- Upload course cover image
- Course instructor relation
- Track enrolled students in a course

### Enrollment

- Student can enroll in a course
- Student can unenroll from a course
- Student can view their enrolled courses
- Admin/Instructor can view course students

### Course Content

The content structure is:

```txt
Course
  └── Modules
        └── Lessons
```

Supported content features:

- Add module to course
- Get course modules
- Get full course content
- Update module
- Delete module
- Add lesson inside module
- Get module lessons
- Get lesson details
- Update lesson
- Delete lesson

### Reviews

- Student can add review to course
- Student can get course reviews
- Student can update their review
- Student can delete their review
- One review per student per course

### Security

- Helmet security headers
- CORS configuration
- Rate limiting
- MongoDB query sanitization
- HTTP Parameter Pollution protection
- Password hashing using bcrypt
- JWT authentication
- Protected routes
- Role authorization middleware

### Logging

- Morgan request logging in development
- Winston error logging to `logs/error.log`

---

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Multer
- Nodemailer
- Cookie Parser
- CORS
- Helmet
- HPP
- express-rate-limit
- express-mongo-sanitize
- Morgan
- Winston
- Validator

---

## Project Structure

```txt
src/
  controller/
    auth.control.js
    course.control.js
    enroll.control.js
    forgetpass.js
    lesson.control.js
    module.control.js
    resetpass.js
    review.control.js
    user.control.js
    verifyemail.js

  middlewares/
    allowedto.js
    checktoken.js
    error_middleware.js
    middlewares.js

  models/
    course.model.js
    enrollment.js
    lesson.model.js
    module.model.js
    review.model.js
    user.model.js

  routes/
    auth.route.js
    content.route.js
    course.route.js
    review.route.js
    user.route.js

  utils/
    apperror.js
    generateJWT.js
    logger.js
    seedAdmin.js
    sendemail.js
    status.js
    userRoles.js

  index.js
```

---

## Installation

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the same folder as `index.js`.

Example:

```env
PORT=3000

MONGO_URI=your_mongodb_connection_string

NODE_ENV=development

JWT_ACCESS_SECRET=your_access_token_secret
JWT_REFRESH_SECRET=your_refresh_token_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

ADMIN_FIRST_NAME=System
ADMIN_LAST_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123456
```

### Important

Do not upload the real `.env` file to GitHub.

Add this to `.gitignore`:

```gitignore
node_modules
.env
logs
uploads/*
```

If you want to keep default images, use:

```gitignore
uploads/*
!uploads/profile.jpg
!uploads/default-avatar.png
```

---

## Run the Project

Development mode:

```bash
npm run run:dev
```

Or run directly:

```bash
node index.js
```

The server will run on:

```txt
http://localhost:3000
```

---

## Create Admin Account

The register endpoint creates `STUDENT` accounts only.

To create or update one admin account, add admin credentials to `.env`, then run:

```bash
node utils/seedAdmin.js
```

This will:

- Create admin if not found
- Update admin if already exists
- Mark admin email as verified
- Ensure only one active admin account exists

---

## API Routes

Base URL:

```txt
http://localhost:3000
```

---

## Auth Routes

### Register

```http
POST /api/register
```

Body type: `form-data`

Fields:

```txt
firstName
lastName
email
password
avatar optional file
```

### Login

```http
POST /api/login
```

Body:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Refresh Token

```http
POST /api/refresh-token
```

### Logout

```http
POST /api/logout
```

Requires authentication.

### Forgot Password

```http
POST /api/forget-password
```

Body:

```json
{
  "email": "user@example.com"
}
```

### Reset Password

```http
PATCH /api/reset-password/:token
```

Body:

```json
{
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

### Verify Email

```http
GET /api/verify-email/:token
```

### Resend Verification Email

```http
POST /api/resend-verification-email
```

Body:

```json
{
  "email": "user@example.com"
}
```

### Update User Role

```http
PATCH /api/users/:id/role
```

Requires `ADMIN`.

Body:

```json
{
  "role": "INSTRUCTOR"
}
```

---

## User Routes

### Get Users

```http
GET /api/users
```

Requires `ADMIN` or `INSTRUCTOR`.

### Get Profile

```http
GET /api/users/profile
```

Requires authentication.

### Update Profile

```http
PATCH /api/users/profile/update
```

Requires authentication.

Body type: `form-data`

Fields:

```txt
firstName optional
lastName optional
avatar optional file
```

---

## Course Routes

### Get Courses

```http
GET /api/courses
```

### Search Courses

```http
GET /api/courses?search=node
```

### Filter Courses by Price

```http
GET /api/courses?minPrice=1000&maxPrice=5000
```

### Sort Courses

```http
GET /api/courses?sort=price
GET /api/courses?sort=-price
GET /api/courses?sort=name
```

### Get Course by ID

```http
GET /api/courses/:id
```

### Create Course

```http
POST /api/courses
```

Requires `ADMIN` or `INSTRUCTOR`.

Body:

```json
{
  "name": "Node.js Course",
  "description": "Backend development course",
  "price": 9000
}
```

### Update Course

```http
PUT /api/courses/:id
```

Requires `ADMIN` or `INSTRUCTOR`.

### Delete Course

```http
DELETE /api/courses/:id
```

Requires `ADMIN` or `INSTRUCTOR`.

### Upload Course Cover

```http
POST /api/courses/:id/upload-cover
```

Requires `ADMIN` or `INSTRUCTOR`.

Body type: `form-data`

Field:

```txt
avatar file
```

---

## Enrollment Routes

### Enroll in Course

```http
POST /api/courses/:id/enroll
```

Requires `STUDENT`.

### Unenroll from Course

```http
DELETE /api/courses/:id/unenroll
```

Requires `STUDENT`.

### Get My Courses

```http
GET /api/courses/my-courses
```

Requires `STUDENT` or `ADMIN`.

### Get Course Students

```http
GET /api/courses/:id/students
```

Requires `ADMIN` or `INSTRUCTOR`.

---

## Course Content Routes

Content routes are mounted under:

```txt
/api/courses
```

### Add Module to Course

```http
POST /api/courses/:courseId/modules
```

Requires `ADMIN` or `INSTRUCTOR`.

Body:

```json
{
  "title": "Module 1: Introduction",
  "order": 1
}
```

### Get Course Modules

```http
GET /api/courses/:courseId/modules
```

### Get Full Course Content

```http
GET /api/courses/:courseId/content
```

### Update Module

```http
PATCH /api/courses/modules/:moduleId
```

Requires `ADMIN` or `INSTRUCTOR`.

### Delete Module

```http
DELETE /api/courses/modules/:moduleId
```

Requires `ADMIN` or `INSTRUCTOR`.

### Add Lesson to Module

```http
POST /api/courses/:moduleId/lessons
```

Requires `ADMIN` or `INSTRUCTOR`.

Body:

```json
{
  "title": "Lesson 1: What is Node.js?",
  "description": "Introduction lesson",
  "content": "Node.js is a JavaScript runtime.",
  "video_url": "https://example.com/video.mp4",
  "order": 1,
  "is_previewed": true
}
```

### Get Module Lessons

```http
GET /api/courses/:moduleId/lessons
```

Requires `ADMIN`, `INSTRUCTOR`, or `STUDENT`.

### Get Lesson by ID

```http
GET /api/courses/lessons/:lessonId
```

Requires `ADMIN`, `INSTRUCTOR`, or `STUDENT`.

### Update Lesson

```http
PATCH /api/courses/lessons/:lessonId
```

Requires `ADMIN` or `INSTRUCTOR`.

### Delete Lesson

```http
DELETE /api/courses/lessons/:lessonId
```

Requires `ADMIN` or `INSTRUCTOR`.

---

## Review Routes

### Add Review

```http
POST /api/courses/:courseId/reviews
```

Requires `STUDENT`.

Body:

```json
{
  "rating": 5,
  "comment": "Great course"
}
```

### Get Reviews

```http
GET /api/courses/:courseId/reviews
```

Requires `STUDENT`.

### Update Review

```http
PATCH /api/courses/:courseId/reviews
```

Requires `STUDENT`.

Body:

```json
{
  "rating": 4,
  "comment": "Updated review"
}
```

### Delete Review

```http
DELETE /api/courses/:courseId/reviews
```

Requires `STUDENT`.

---

## Authentication

Protected endpoints accept token from:

### Cookie

```txt
accessToken
```

### Authorization Header

```txt
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## File Uploads

Uploaded images are saved in:

```txt
uploads/
```

Static files are served from:

```txt
/uploads
```

Example:

```txt
http://localhost:3000/uploads/image-name.jpg
```

---

## Email Setup

This project uses Nodemailer with Gmail.

Use Gmail App Password, not your normal Gmail password.

Required `.env` values:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

---

## Security Notes

Before pushing to GitHub or submitting the project:

1. Delete `.env` from the repository.
2. Delete `node_modules`.
3. Delete `.git` if you are sending the project as a zip file.
4. Change exposed secrets.
5. Use strong JWT secrets.
6. Use Gmail App Password.
7. Keep register route creating `STUDENT` only.
8. Create admin using `seedAdmin.js`.

---

## Common Problems

### Too Many Requests

The project uses rate limiting. During development, increase the limit or disable it temporarily in `index.js`.

### Cannot GET /api/verify-email/:token

Make sure this route exists:

```http
GET /api/verify-email/:token
```

### Invalid or Expired Verification Token

Check that the verification expiry field is saved correctly in the user document.

### Gmail Invalid Login

Use a Gmail App Password instead of your Gmail account password.

### Invalid Course ID

Make sure custom routes like `/my-courses` are defined before `/:id` routes.

---

## Notes

- The backend is designed for local frontend origin:

```txt
http://localhost:5173
```

- Update the CORS origin when deploying.
- The current development command is:

```bash
npm run run:dev
```

- Register creates unverified student accounts.
- Users must verify their email before login if email verification is enforced.
