# Backend links required for email verification and password reset

The frontend now supports these pages:

- `/verify-email/:token`
- `/api/verify-email/:token`
- `/reset-password/:token`
- `/api/reset-password/:token`

For the best user experience, the backend emails should point to the frontend app, not directly to the API JSON endpoints.

Recommended backend environment variable:

```env
FRONTEND_URL=http://localhost:5173
```

Recommended email verification URL in the backend:

```js
const verificationURL = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
```

Recommended reset password URL in the backend:

```js
const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
```

The frontend dev server also includes a Vite proxy bypass so that browser navigations to `/api/verify-email/:token` or `/api/reset-password/:token` on the frontend port still load the React pages instead of a JSON response.
