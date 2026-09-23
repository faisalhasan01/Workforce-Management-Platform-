# WorkforceHub - Workforce & Project Management Platform (Frontend)

A modern, responsive React + Vite application for project tracking, agile sprint planning, kanban boards, real-time team collaboration, documents management, and analytics.

---

## 🚀 Key Features

- **Executive Operations Dashboard**: High-level KPIs, project velocity, active sprint progress, and task distribution charts.
- **Interactive Agile Kanban Board**: Drag-and-drop workflow columns (Backlog, In Progress, In Review, Completed), priority badges, subtasks, and instant status updates.
- **Multi-Tenant Organization & Projects**: Switch workspaces, manage project lifecycles, and view project health.
- **Team & Workforce Management**: Role-based access control (Owner, Admin, Project Manager, Member, Viewer) with permissions and member directory.
- **Real-Time Team Chat**: Socket.io integration with channel messaging and direct team conversations.
- **Enterprise Document Hub**: Manage requirements docs, specifications, and project assets.
- **Audit Trails & Security Logs**: Comprehensive compliance logging for enterprise security.
- **Built-in AI Assistant**: Automated task breakdown, sprint estimation, and intelligent productivity summaries.

---

## 🛠️ Tech Stack

- **Framework**: React 18, Vite
- **Styling**: Tailwind CSS, Modern Glassmorphism & Sleek Dark Mode UI
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Real-Time**: Socket.io-client

---

## ⚡ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
If running against a custom backend URL, create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
*(By default, Vite proxies `/api` and `/socket.io` to `http://localhost:5000`)*

### 3. Run Development Server
```bash
npm run dev
```
Visit: [http://localhost:5173](http://localhost:5173)

### 4. Build for Production
```bash
npm run build
```

---

## 📄 License
MIT
