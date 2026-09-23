import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { initSocket } from './config/socket.js';
import { seedDatabase } from './seed/seedData.js';
import User from './models/User.js';

import authRoutes from './routes/authRoutes.js';
import orgRoutes from './routes/orgRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import sprintRoutes from './routes/sprintRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
const io = initSocket(server);

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Serve uploaded static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Workforce Management API Gateway',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/orgs', orgRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/sprints', sprintRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/ai', aiRoutes);

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Check if database needs automated seeding
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] No existing records found. Auto-seeding enterprise database...');
      await seedDatabase();
    }

    server.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 Workforce Management Platform Server is RUNNING`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔑 Demo Accounts:`);
      console.log(`   - Owner/Admin: admin@enterprise.com (Password123!)`);
      console.log(`   - PM:          manager@enterprise.com (Password123!)`);
      console.log(`   - Dev/Member:  dev@enterprise.com (Password123!)`);
      console.log(`   - Viewer:      client@enterprise.com (Password123!)`);
      console.log(`==================================================\n`);
    });
  } catch (error) {
    console.error('Fatal Server Startup Error:', error.message);
    process.exit(1);
  }
};

startServer();

export { app, server, io };
