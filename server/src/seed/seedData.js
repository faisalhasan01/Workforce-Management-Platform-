import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import Project from '../models/Project.js';
import Sprint from '../models/Sprint.js';
import Task from '../models/Task.js';
import Message from '../models/Message.js';
import Document from '../models/Document.js';
import AuditLog from '../models/AuditLog.js';
import { connectDB, closeDB } from '../config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Project.deleteMany({}),
      Sprint.deleteMany({}),
      Task.deleteMany({}),
      Message.deleteMany({}),
      Document.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);

    console.log('[Seed] Generating IDs and demo organizations...');
    const adminId = new mongoose.Types.ObjectId();
    const managerId = new mongoose.Types.ObjectId();
    const devId = new mongoose.Types.ObjectId();
    const clientId = new mongoose.Types.ObjectId();

    const acmeOrg = await Organization.create({
      name: 'Acme Enterprise Solutions',
      slug: 'acme-corp',
      plan: 'Enterprise',
      inviteCode: 'ACME2026',
      owner: adminId,
    });

    const novaOrg = await Organization.create({
      name: 'TechNova AI Labs',
      slug: 'technova-labs',
      plan: 'Professional',
      inviteCode: 'NOVA2026',
      owner: adminId,
    });

    console.log('[Seed] Creating users across RBAC tiers...');
    const adminUser = await User.create({
      _id: adminId,
      name: 'Sarah Jenkins',
      email: 'admin@enterprise.com',
      password: 'Password123!',
      jobTitle: 'VP of Engineering',
      department: 'Executive Leadership',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      organizations: [
        { organization: acmeOrg._id, role: 'Owner' },
        { organization: novaOrg._id, role: 'Admin' },
      ],
      activeOrganization: acmeOrg._id,
    });

    const managerUser = await User.create({
      _id: managerId,
      name: 'Alex Rivera',
      email: 'manager@enterprise.com',
      password: 'Password123!',
      jobTitle: 'Lead Technical PM',
      department: 'Product Delivery',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      organizations: [
        { organization: acmeOrg._id, role: 'Project Manager' },
      ],
      activeOrganization: acmeOrg._id,
    });

    const devUser = await User.create({
      _id: devId,
      name: 'David Chen',
      email: 'dev@enterprise.com',
      password: 'Password123!',
      jobTitle: 'Senior Full-Stack Engineer',
      department: 'Engineering',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      organizations: [
        { organization: acmeOrg._id, role: 'Team Member' },
      ],
      activeOrganization: acmeOrg._id,
    });

    const clientUser = await User.create({
      _id: clientId,
      name: 'Elena Rostova',
      email: 'client@enterprise.com',
      password: 'Password123!',
      jobTitle: 'Strategic Stakeholder',
      department: 'Client Advisory',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      status: 'Active',
      organizations: [
        { organization: acmeOrg._id, role: 'Viewer' },
      ],
      activeOrganization: acmeOrg._id,
    });

    // Update organization owners
    acmeOrg.owner = adminUser._id;
    await acmeOrg.save();
    novaOrg.owner = adminUser._id;
    await novaOrg.save();

    console.log('[Seed] Creating enterprise projects...');
    const projectCloud = await Project.create({
      organization: acmeOrg._id,
      name: 'Nexus Cloud Infrastructure',
      key: 'NEX',
      description: 'Microservices architecture with auto-scaling Kubernetes cluster and zero-downtime CI/CD.',
      status: 'Active',
      priority: 'Critical',
      budget: 120000,
      targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      lead: adminUser._id,
      members: [adminUser._id, managerUser._id, devUser._id, clientUser._id],
      tags: ['Cloud', 'DevOps', 'Security'],
      taskCounter: 6,
    });

    const projectAI = await Project.create({
      organization: acmeOrg._id,
      name: 'Enterprise AI Analytics Suite',
      key: 'AIA',
      description: 'Real-time telemetry and predictive workload allocation using deep learning algorithms.',
      status: 'Active',
      priority: 'High',
      budget: 85000,
      targetDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      lead: managerUser._id,
      members: [adminUser._id, managerUser._id, devUser._id],
      tags: ['AI/ML', 'Analytics', 'DataOps'],
      taskCounter: 4,
    });

    const projectMobile = await Project.create({
      organization: acmeOrg._id,
      name: 'Executive Mobile Client',
      key: 'MOB',
      description: 'Cross-platform native companion app for C-suite executive reporting and push notifications.',
      status: 'Planning',
      priority: 'Medium',
      budget: 50000,
      targetDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      lead: managerUser._id,
      members: [managerUser._id, devUser._id],
      tags: ['Mobile', 'React Native'],
      taskCounter: 2,
    });

    console.log('[Seed] Creating Agile Sprints...');
    const sprint1 = await Sprint.create({
      organization: acmeOrg._id,
      project: projectCloud._id,
      name: 'Sprint 24: Core Gateway & Auth',
      goal: 'Deliver production-grade JWT authentication and API rate-limiting gateway.',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'Active',
      velocity: 28,
    });

    const sprintPast = await Sprint.create({
      organization: acmeOrg._id,
      project: projectCloud._id,
      name: 'Sprint 23: Database Architecture',
      goal: 'Database clustering, indexes, and sharding benchmark.',
      startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'Completed',
      velocity: 34,
    });

    console.log('[Seed] Creating Kanban tasks with subtasks & comments...');
    await Task.create([
      {
        organization: acmeOrg._id,
        project: projectCloud._id,
        sprint: sprint1._id,
        key: 'NEX-1',
        title: 'Architect multi-tenant RBAC token verification system',
        description: 'Implement JWT signing with RS256, organization claims, and dynamic role permissions guard.',
        status: 'Done',
        priority: 'Urgent',
        storyPoints: 8,
        assignee: devUser._id,
        reporter: adminUser._id,
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        tags: ['Security', 'Backend'],
        order: 0,
        subtasks: [
          { title: 'Define organization membership schema', completed: true, completedAt: new Date() },
          { title: 'Configure JWT validation interceptor', completed: true, completedAt: new Date() },
          { title: 'Write unit tests for unauthorized tenants', completed: true, completedAt: new Date() },
        ],
        comments: [
          {
            user: adminUser._id,
            text: 'Ensure cross-tenant leakage is strictly prevented via middleware.',
            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          },
          {
            user: devUser._id,
            text: 'Implemented x-organization-id tenant scoping with tests passing 100%.',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        ],
      },
      {
        organization: acmeOrg._id,
        project: projectCloud._id,
        sprint: sprint1._id,
        key: 'NEX-2',
        title: 'Implement drag-and-drop Kanban state synchronization',
        description: 'Build interactive Kanban board columns with instant drag drop and Socket.IO broadcast updates.',
        status: 'In Progress',
        priority: 'High',
        storyPoints: 5,
        assignee: devUser._id,
        reporter: managerUser._id,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        tags: ['Frontend', 'Kanban'],
        order: 0,
        subtasks: [
          { title: 'Create column container drop targets', completed: true, completedAt: new Date() },
          { title: 'Wire PUT /api/tasks/:id/move payload', completed: true, completedAt: new Date() },
          { title: 'Connect socket listeners for remote card shifts', completed: false },
        ],
        comments: [
          {
            user: managerUser._id,
            text: 'Please test smooth dragging on Firefox and Safari as well.',
            createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          },
        ],
      },
      {
        organization: acmeOrg._id,
        project: projectCloud._id,
        sprint: sprint1._id,
        key: 'NEX-3',
        title: 'Build Executive KPI & Velocity Analytics Engine',
        description: 'Aggregate completed sprint points, task completion velocity, and workload distribution charts.',
        status: 'In Review',
        priority: 'High',
        storyPoints: 5,
        assignee: managerUser._id,
        reporter: adminUser._id,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        tags: ['Analytics', 'Charts'],
        order: 0,
        subtasks: [
          { title: 'Aggregate sprint completion percentages', completed: true, completedAt: new Date() },
          { title: 'Render visual velocity trend bar charts', completed: true, completedAt: new Date() },
        ],
      },
      {
        organization: acmeOrg._id,
        project: projectCloud._id,
        sprint: sprint1._id,
        key: 'NEX-4',
        title: 'Establish live WebSocket channel chat and notifications',
        description: 'Provide persistent team channel discussions, typing indicators, and assignment alerts.',
        status: 'Todo',
        priority: 'Medium',
        storyPoints: 5,
        assignee: devUser._id,
        reporter: managerUser._id,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        tags: ['Socket.IO', 'Chat'],
        order: 0,
        subtasks: [
          { title: 'Create chat channel schema in Mongo', completed: false },
          { title: 'Build instant messaging bubble component', completed: false },
        ],
      },
      {
        organization: acmeOrg._id,
        project: projectCloud._id,
        key: 'NEX-5',
        title: 'Configure automated Docker & container orchestration',
        description: 'Multi-stage Dockerfiles for client and server with docker-compose networking.',
        status: 'Backlog',
        priority: 'Medium',
        storyPoints: 3,
        assignee: adminUser._id,
        reporter: adminUser._id,
        tags: ['DevOps', 'Docker'],
        order: 0,
      },
      {
        organization: acmeOrg._id,
        project: projectAI._id,
        key: 'AIA-1',
        title: 'Develop AI Subtask Breakdown & User Story Generator',
        description: 'Leverage AI heuristics to break broad task descriptions into verifiable technical steps.',
        status: 'Done',
        priority: 'Urgent',
        storyPoints: 5,
        assignee: devUser._id,
        reporter: adminUser._id,
        tags: ['AI', 'Productivity'],
        order: 0,
      },
      {
        organization: acmeOrg._id,
        project: projectAI._id,
        key: 'AIA-2',
        title: 'Automated Daily Standup synthesis assistant',
        description: 'Summarize member ticket updates into structured Yesterday, Today, Blockers format.',
        status: 'In Progress',
        priority: 'High',
        storyPoints: 5,
        assignee: devUser._id,
        reporter: managerUser._id,
        tags: ['AI', 'Agile'],
        order: 1,
      },
    ]);

    console.log('[Seed] Creating default chat channel messages...');
    await Message.create([
      {
        organization: acmeOrg._id,
        channel: 'general',
        sender: adminUser._id,
        content: 'Welcome to NexusWork Enterprise platform! Sprint 24 is officially underway.',
      },
      {
        organization: acmeOrg._id,
        channel: 'general',
        sender: managerUser._id,
        content: 'All sprint deliverables have been updated on the Kanban board. Please review your assigned tickets.',
      },
      {
        organization: acmeOrg._id,
        channel: 'general',
        sender: devUser._id,
        content: 'Task NEX-1 (multi-tenant RBAC) is completed and verified. Moving on to NEX-2 Kanban real-time sync.',
      },
      {
        organization: acmeOrg._id,
        channel: 'engineering',
        sender: devUser._id,
        content: 'Socket.IO rooms have been scoped by organization tenant ID to ensure strict data privacy.',
      },
    ]);

    console.log('[Seed] Creating enterprise documents & assets...');
    await Document.create([
      {
        organization: acmeOrg._id,
        project: projectCloud._id,
        title: 'System Architecture Specification v2.4',
        fileName: 'system_architecture_spec.pdf',
        fileUrl: '/uploads/sample_architecture.pdf',
        fileSize: 2450000,
        mimeType: 'application/pdf',
        category: 'Architecture',
        uploadedBy: adminUser._id,
        tags: ['Specs', 'Architecture', 'v2'],
      },
      {
        organization: acmeOrg._id,
        project: projectCloud._id,
        title: 'SOC-2 Compliance & Security Guidelines',
        fileName: 'soc2_security_audit.pdf',
        fileUrl: '/uploads/sample_security.pdf',
        fileSize: 1820000,
        mimeType: 'application/pdf',
        category: 'Specifications',
        uploadedBy: adminUser._id,
        tags: ['Security', 'Compliance'],
      },
      {
        organization: acmeOrg._id,
        project: projectAI._id,
        title: 'AI Machine Learning Pipeline Benchmark',
        fileName: 'ml_pipeline_benchmark.json',
        fileUrl: '/uploads/sample_benchmark.json',
        fileSize: 520000,
        mimeType: 'application/json',
        category: 'Assets',
        uploadedBy: devUser._id,
        tags: ['AI', 'DataOps'],
      },
    ]);

    console.log('[Seed] Recording audit log trails...');
    await AuditLog.create([
      {
        organization: acmeOrg._id,
        user: adminUser._id,
        action: 'ORGANIZATION_INITIALIZED',
        entityType: 'Organization',
        entityId: acmeOrg._id.toString(),
        details: { name: acmeOrg.name, plan: 'Enterprise' },
      },
      {
        organization: acmeOrg._id,
        user: adminUser._id,
        action: 'PROJECT_CREATED',
        entityType: 'Project',
        entityId: projectCloud._id.toString(),
        details: { name: projectCloud.name, key: 'NEX' },
      },
      {
        organization: acmeOrg._id,
        user: managerUser._id,
        action: 'SPRINT_STARTED',
        entityType: 'Sprint',
        entityId: sprint1._id.toString(),
        details: { name: sprint1.name },
      },
      {
        organization: acmeOrg._id,
        user: devUser._id,
        action: 'TASK_MOVED',
        entityType: 'Task',
        entityId: 'NEX-1',
        details: { from: 'In Review', to: 'Done' },
      },
    ]);

    console.log('✅ [Seed] Enterprise database seeded successfully with rich demo data!');
  } catch (error) {
    console.error('❌ [Seed] Error seeding database:', error.message);
  }
};

// If run directly via node command
if (process.argv[1].endsWith('seedData.js')) {
  seedDatabase().then(async () => {
    await closeDB();
    process.exit(0);
  });
}
