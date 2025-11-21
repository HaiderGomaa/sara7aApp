# sara3aApp - Backend API

A Node.js / Express backend for sara3aApp. Provides user authentication (JWT), file uploads (multer + Cloudinary), messaging endpoints, role-based authorization, validation, and utilities for encryption and tokens.

## Features
- JWT-based authentication and refresh/revoke flows
- Role-based authorization (USER, ADMIN)
- Single and multi-file uploads (profileImage, coverImages)
- Cloudinary integration for media storage
- Mongoose models and DB service helpers
- Validation with Joi, AES/RSA utilities

## Tech stack
- Node.js (ES modules)
- Express 5
- MongoDB + Mongoose
- Multer + Cloudinary
- Joi validation
- JWT for authentication

## Prerequisites
- Node 18+ / npm
- MongoDB instance (local or remote)
- Cloudinary account (for uploads)

## Setup
1. Clone repository
2. Install dependencies

```bash
npm install
```

3. Create environment files

- `src/config/.env.dev` (used by dev script) or set environment variables directly. The following are commonly required:

```
PORT=3000
MONGODB_URI=<your-mongo-uri>
TOKEN_ACCESS_SECRETE=<access-secret>
TOKEN_REFRESH_SECRETE=<refresh-secret>
ENCRYPTION_SECRETE_KEY=<32-byte-secret>
IV_LENGTH=16
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
```

4. Ensure RSA files exist (private.pem, public.pem) in project root or the app will generate them on first run.

## Run (development)

```bash
npm run dev
```

This runs: `node --env-file=./src/config/.env.dev --watch index.js` (see `package.json`).

## Available endpoints (brief)
- POST /api/v1/auth/signup — register
- POST /api/v1/auth/login — login (returns tokens)
- POST /api/v1/auth/revoke-token — logout (requires auth)
- POST /api/v1/auth/refresh-token — refresh token (uses refresh token middleware)

- PATCH /api/v1/user/profile-image — upload single profile image (multipart/form-data, field `profileImage`)
- PATCH /api/v1/user/cover-images — upload up to 4 images (multipart/form-data, repeated field `coverImages`)

- More routes live in `src/modules/*`

## Upload usage
- Multer field names:
  - `profileImage` — single file
  - `coverImages` — multiple files (repeat field up to 4 times)

Example curl (profile image):

```bash
curl -X PATCH "http://localhost:3000/api/v1/user/profile-image" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "profileImage=@/path/to/image.jpg"
```

## Development notes & gotchas
- The project expects certain env variables (DB URI, JWT secrets, Cloudinary credentials). If missing, the server may log connection failures but still start.
- Validation middleware expects `req.file` for single uploads and `req.files` (array) for multi-uploads.
- There are two places for media storage in user model: `coverImages` (array of URL strings) and `cloudCoverImages` (array of objects containing `public_id` and `secure_url`).

## Tests and debugging
- Use Postman or curl to test multipart uploads.
- Add temporary console logs in `src/MiddleWare/auth.middleware.js` to inspect `req.user` when debugging authentication/authorization.

## Contributing
- Keep routes modular under `src/modules/*` and services in `src/modules/*/*.service.js`.
- Use db service helpers in `src/DB/db.service.js` to interact with Mongoose models.

## Contact
If you need help running locally or want me to add sample Postman requests, tell me which environment variables you have and I’ll generate a runnable `.env.dev` example.
