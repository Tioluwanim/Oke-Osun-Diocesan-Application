# Oke Osun Diocese

This repository contains an Expo React Native mobile app and a FastAPI backend that supports authentication, parish management, sermons, events, live streaming data, magazines, bible studies, documents, and admin controls.

## Project structure

- `App.js` — Expo app entrypoint
- `src/` — React Native application
- `backend/` — FastAPI backend with MongoDB integration

## Local setup

### Backend

1. Create a Python virtual environment:
   ```powershell
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
2. Install requirements:
   ```powershell
   pip install -r requirements.txt
   ```
3. Copy `backend/.env.example` to `backend/.env` and set values:
   ```powershell
   copy .env.example .env
   ```
4. Start the backend server:
   ```powershell
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend

1. Install npm dependencies from project root:
   ```powershell
   npm install
   ```
2. Start Expo:
   ```powershell
   npm start
   ```
3. In development, the app will use the local backend URL automatically:
   - `http://localhost:8000` for iOS and web
   - `http://10.0.2.2:8000` for Android emulator

## Environment variables

### Backend

Create a `.env` file in `backend/` with the following keys:

- `MONGO_URI` — MongoDB connection string
- `DATABASE_NAME` — MongoDB database name
- `JWT_SECRET` — secret used to sign JWT tokens
- `JWT_EXPIRE_DAYS` — optional expiration period for tokens (default `7`)
- `ENVIRONMENT` — `development` or `production`
- `CORS_ORIGINS` — comma-separated allowed origins for production CORS

Example:

```env
MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=oke_osun_diocese
JWT_SECRET=replace_with_a_secure_secret
JWT_EXPIRE_DAYS=7
ENVIRONMENT=development
CORS_ORIGINS=https://oke-osun-diocesan-application.onrender.com
```

### Frontend

Create a root `.env` file for Expo from `.env.example`:

```env
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

For Android emulators, use `http://10.0.2.2:8000`.

## Running tests

From the `backend/` directory:

```powershell
pytest
```

## Notes

- The backend now loads CORS origins from `CORS_ORIGINS` and uses a safe fallback in development.
- JWT expiration is implemented correctly using a UTC timestamp.
- The mobile app chooses the local API base URL automatically when running in development.
- The frontend route configuration now includes full route helpers for all backend resources.
