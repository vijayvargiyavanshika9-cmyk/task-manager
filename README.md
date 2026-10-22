# FlowTask — Modern Card-Based Task Manager

A production-grade, card-based Kanban task management application built using **React (Vite) + Tailwind CSS**, **Node.js + Express**, and **MongoDB + Mongoose**, orchestrated via **Docker Compose**.

Developed to serve as an incremental, production-quality benchmark for automated PR review systems.

---

## 🏗️ Architecture & Monorepo Structure

```text
Task-Manager/
├── docker-compose.yml          # MongoDB 7.0 container with persistent named volumes
├── plan.md                     # Complete architectural specification & 3-PR roadmap
├── progress.md                 # Real-time task tracker and quality gates
├── client/                     # Frontend React (Vite) Single-Page Application
│   ├── src/
│   │   ├── context/            # AuthContext with session persistence & Axios interceptor binding
│   │   ├── pages/              # Card-based Login, Register, and Dashboard views
│   │   ├── routes/             # ProtectedRoute & PublicRoute guards
│   │   ├── services/           # Axios client configured with Bearer injection & 401 handler
│   │   ├── index.css           # Tailwind base + custom typography & sleek scrollbars
│   │   └── App.jsx             # React Router v6 routing tree
│   └── package.json
└── server/                     # Backend Express REST API
    ├── src/
    │   ├── config/             # Zod environment validation & MongoDB connection manager
    │   ├── controllers/        # Thin HTTP controllers
    │   ├── middlewares/        # JWT auth guard, centralized error handler, rate limiter
    │   ├── models/             # Mongoose User model with bcrypt & sanitized toJSON
    │   ├── routes/             # API routes
    │   ├── services/           # Auth domain business logic
    │   ├── utils/              # AppError class & asyncHandler wrapper
    │   ├── validators/         # Zod request payload schemas
    │   ├── app.js              # Express app pipeline with Helmet, CORS, and rate limiting
    │   ├── server.js           # Server bootstrap with graceful shutdown
    │   └── test-auth.js        # Automated end-to-end auth test suite
    └── package.json
```

---

## 🚀 Incremental PR Roadmap

- **[ ] PR 1: Core Domain — Projects & Card-Based Kanban Board CRUD**
  - Project and Task schemas with ownership and cascade delete hooks.
  - 4-column responsive Kanban board (`To Do`, `In Progress`, `In Review`, `Done`).
- **[ ] PR 2: Advanced Features — Search, Multi-Filter, Comments & Analytics**
  - MongoDB text indexing and multi-criteria query filters.
  - Task comment.
  - High-performance aggregation pipeline for workspace completion metrics and visual stats.

---

## 🛠️ Getting Started Locally

### 1. Start MongoDB via Docker
```bash
docker compose up -d
```

### 2. Start Backend API
```bash
cd server
npm install
npm run dev
```
API runs on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).

### 3. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173`.

### 4. Run Automated Authentication Test Suite
```bash
cd server
npm test
```
Runs the end-to-end integration test verifying user registration, duplicate email rejection (409), password validation, JWT signing/decoding, profile lookup, and clean teardown.
