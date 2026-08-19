# 🎓 Campus Marketplace

A university-student-only e-commerce marketplace built with the MERN stack (MongoDB, Express, React, Node.js).

---

## 🏗️ Architecture & Project Structure

The codebase is strictly separated into `frontend` (React + Vite) and `backend` (Node.js + Express).

```
campus-marketplace/
├── .gitignore              # Root gitignore (ensures zero environment secret leaks)
├── README.md               # Architecture and setup guide
├── backend/                # Node.js + Express API
│   ├── .env.example        # Environment variable template for backend
│   ├── .gitignore          # Backend gitignore
│   ├── package.json        # Backend dependencies
│   ├── server.js           # Server entry point
│   └── src/
│       └── config/         # Database, Cloudinary, and SMTP configurations
└── frontend/               # React + Vite application
    ├── .env.example        # Environment variable template for frontend
    ├── .gitignore          # Frontend gitignore
    ├── package.json        # Frontend dependencies
    ├── vite.config.js      # Vite build & proxy configuration
    └── src/                # React components & UI logic
```

---

## 🔐 Environment Variables & Security

**CRITICAL**: NEVER commit `.env` files or real passwords/credentials to version control.

### 1. Backend Configuration (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and update the placeholders:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Atlas Database Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxx.mongodb.net/campus_marketplace?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMTP Email Verification & Notifications
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="Campus Marketplace <noreply@campusmarketplace.edu>"
```

### 2. Frontend Configuration (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 Local Development Setup

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend API will run on `http://localhost:5000`. Health endpoint: `http://localhost:5000/api/health`.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend app will run on `http://localhost:5173`.

---

## 🌐 Render Deployment Guide

Both frontend and backend can be deployed separately on **Render's Free Tier**:

### Backend Service on Render:
1. Create a **Web Service** on Render connected to your GitHub repository.
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node server.js`
5. In **Environment Variables**, add:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
   - `CLIENT_URL` (URL of your deployed frontend)

### Frontend Service on Render:
1. Create a **Static Site** on Render connected to your GitHub repository.
2. Set **Root Directory**: `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Publish Directory**: `dist`
5. In **Environment Variables**, add:
   - `VITE_API_BASE_URL` (URL of your deployed Render backend API)
