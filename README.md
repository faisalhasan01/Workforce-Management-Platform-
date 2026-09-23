# Workforce Management Platform

A full-stack MERN platform for project tracking, sprint planning, Kanban workflows, real-time messaging, and team management.

---

## 🏗️ Monorepo Architecture

```text
├── client/                 # React 18 + Vite Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI components & feature modules
│   │   ├── context/        # Auth, Org & Socket state management
│   │   ├── pages/          # Dashboard, Kanban, Projects, Team, Chat, etc.
│   │   └── services/       # Axios API client
│   ├── .env.example        # Sample frontend env config
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                 # Node.js + Express + MongoDB Backend API
│   ├── src/
│   │   ├── config/         # MongoDB & WebSocket connection setup
│   │   ├── controllers/    # Business logic & request handlers
│   │   ├── middleware/     # JWT auth, RBAC permissions, error handling
│   │   ├── models/         # Mongoose data models
│   │   ├── routes/         # REST API endpoints
│   │   └── seed/           # Automated enterprise demo data seeder
│   └── .env.example        # Sample backend env config
│
└── README.md
```

---

## ⚡ Deployment Instructions

### 1️⃣ Deploy Backend on Render (Web Service)

1. Connect your GitHub repository on [Render](https://dashboard.render.com).
2. Configure the Web Service:
   * **Root Directory**: `server`
   * **Build Command**: `npm install`
   * **Start Command**: `npm start`
3. Add **Environment Variables** in Render:
   * `NODE_ENV`: `production`
   * `PORT`: `5000`
   * `MONGO_URI`: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/enterprise_saas?retryWrites=true&w=majority`
   * `JWT_SECRET`: `your_secure_jwt_secret_key`
   * `JWT_EXPIRES_IN`: `7d`
   * `CLIENT_URL`: `https://your-app-name.vercel.app` (your deployed Vercel frontend URL)

---

### 2️⃣ Deploy Frontend on Vercel

1. Import your GitHub repository on [Vercel](https://vercel.com).
2. Set the Project Root:
   * **Root Directory**: `client`
   * **Framework Preset**: `Vite`
3. Add **Environment Variables** in Vercel:
   * **Key**: `VITE_API_BASE_URL`
   * **Value**: `https://<your-render-backend-name>.onrender.com/api`
4. Click **Deploy**.

---

## 💻 Local Development Setup

### 1. Backend Server
```bash
cd server
npm install
npm run dev
```
Backend runs at `http://localhost:5000` *(includes automated in-memory MongoDB fallback and seed data generator)*.

### 2. Frontend Client
```bash
cd client
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`.

---

## 🔑 Demo Accounts (Pre-configured)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Owner / Admin** | `admin@enterprise.com` | `Password123!` |
| **Project Manager** | `manager@enterprise.com` | `Password123!` |
| **Developer / Member** | `dev@enterprise.com` | `Password123!` |
| **Viewer / Client** | `client@enterprise.com` | `Password123!` |

---

## 📄 License
MIT
