import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Sprint from '../models/Sprint.js';
import { logActivity } from '../utils/auditLogger.js';

// @desc    Get all projects for the organization
// @route   GET /api/projects
export const getProjects = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = { organization: req.organization._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await Project.find(query)
      .populate('lead', 'name email avatar')
      .populate('members', 'name email avatar jobTitle')
      .sort({ updatedAt: -1 });

    // Enhance projects with task metrics (total, completed, progress percentage)
    const enhancedProjects = await Promise.all(
      projects.map(async (p) => {
        const totalTasks = await Task.countDocuments({ project: p._id });
        const completedTasks = await Task.countDocuments({ project: p._id, status: 'Done' });
        const activeSprints = await Sprint.countDocuments({ project: p._id, status: 'Active' });

        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
          ...p.toObject(),
          totalTasks,
          completedTasks,
          activeSprints,
          progress,
        };
      })
    );

    res.json({
      success: true,
      count: enhancedProjects.length,
      projects: enhancedProjects,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
export const createProject = async (req, res) => {
  try {
    const { name, key, description, status, priority, budget, targetDate, lead, members, tags } = req.body;

    if (!name || !key) {
      return res.status(400).json({ success: false, message: 'Please provide project name and key.' });
    }

    const existingKey = await Project.findOne({
      organization: req.organization._id,
      key: key.toUpperCase().trim(),
    });

    if (existingKey) {
      return res.status(400).json({ success: false, message: `Project key '${key}' already exists in this organization.` });
    }

    const project = await Project.create({
      organization: req.organization._id,
      name,
      key: key.toUpperCase().trim(),
      description,
      status: status || 'Active',
      priority: priority || 'Medium',
      budget: budget || 50000,
      targetDate,
      lead: lead || req.user._id,
      members: members || [req.user._id],
      tags: tags || ['Core'],
    });

    // Create default Sprint 1 for this project
    await Sprint.create({
      organization: req.organization._id,
      project: project._id,
      name: `${project.key} Sprint 1`,
      goal: `Initial milestone for ${project.name}`,
      status: 'Active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
    });

    await logActivity({
      organizationId: req.organization._id,
      userId: req.user._id,
      action: 'PROJECT_CREATED',
      entityType: 'Project',
      entityId: project._id.toString(),
      details: { name: project.name, key: project.key },
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully.',
      project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get project by ID with stats
// @route   GET /api/projects/:id
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      organization: req.organization._id,
    })
      .populate('lead', 'name email avatar jobTitle')
      .populate('members', 'name email avatar jobTitle department');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    const totalTasks = await Task.countDocuments({ project: project._id });
    const completedTasks = await Task.countDocuments({ project: project._id, status: 'Done' });
    const inProgressTasks = await Task.countDocuments({ project: project._id, status: 'In Progress' });
    const sprints = await Sprint.find({ project: project._id }).sort({ createdAt: -1 });

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      success: true,
      project: {
        ...project.toObject(),
        totalTasks,
        completedTasks,
        inProgressTasks,
        progress,
        sprints,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
export const updateProject = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, organization: req.organization._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    await logActivity({
      organizationId: req.organization._id,
      userId: req.user._id,
      action: 'PROJECT_UPDATED',
      entityType: 'Project',
      entityId: project._id.toString(),
      details: { name: project.name, updates: req.body },
    });

    res.json({
      success: true,
      message: 'Project updated successfully.',
      project,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      organization: req.organization._id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Cascade delete project tasks & sprints
    await Task.deleteMany({ project: project._id });
    await Sprint.deleteMany({ project: project._id });

    await logActivity({
      organizationId: req.organization._id,
      userId: req.user._id,
      action: 'PROJECT_DELETED',
      entityType: 'Project',
      entityId: project._id.toString(),
      details: { name: project.name, key: project.key },
    });

    res.json({
      success: true,
      message: 'Project and associated tasks/sprints deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
