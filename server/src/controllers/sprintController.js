import Sprint from '../models/Sprint.js';
import Task from '../models/Task.js';
import { logActivity } from '../utils/auditLogger.js';

// @desc    Get all sprints for a project
// @route   GET /api/sprints
export const getSprints = async (req, res) => {
  try {
    const { projectId } = req.query;
    const query = { organization: req.organization._id };

    if (projectId) {
      query.project = projectId;
    }

    const sprints = await Sprint.find(query).sort({ createdAt: -1 });

    // Enhance sprints with task count & total story points
    const enhancedSprints = await Promise.all(
      sprints.map(async (s) => {
        const tasks = await Task.find({ sprint: s._id });
        const totalPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
        const completedPoints = tasks
          .filter((t) => t.status === 'Done')
          .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

        return {
          ...s.toObject(),
          totalTasks: tasks.length,
          totalPoints,
          completedPoints,
        };
      })
    );

    res.json({
      success: true,
      count: enhancedSprints.length,
      sprints: enhancedSprints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new sprint
// @route   POST /api/sprints
export const createSprint = async (req, res) => {
  try {
    const { projectId, name, goal, startDate, endDate } = req.body;

    if (!projectId || !name) {
      return res.status(400).json({ success: false, message: 'Project ID and Sprint Name are required.' });
    }

    const sprint = await Sprint.create({
      organization: req.organization._id,
      project: projectId,
      name,
      goal: goal || '',
      startDate: startDate || new Date(),
      endDate: endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'Backlog',
    });

    await logActivity({
      organizationId: req.organization._id,
      userId: req.user._id,
      action: 'SPRINT_CREATED',
      entityType: 'Sprint',
      entityId: sprint._id.toString(),
      details: { name: sprint.name, project: projectId },
    });

    res.status(201).json({
      success: true,
      message: 'Sprint created successfully.',
      sprint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Start sprint
// @route   PUT /api/sprints/:id/start
export const startSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findOne({
      _id: req.params.id,
      organization: req.organization._id,
    });

    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found.' });
    }

    sprint.status = 'Active';
    sprint.startDate = new Date();
    await sprint.save();

    await logActivity({
      organizationId: req.organization._id,
      userId: req.user._id,
      action: 'SPRINT_STARTED',
      entityType: 'Sprint',
      entityId: sprint._id.toString(),
      details: { name: sprint.name },
    });

    res.json({
      success: true,
      message: `Sprint '${sprint.name}' is now active.`,
      sprint,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete sprint
// @route   PUT /api/sprints/:id/complete
export const completeSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findOne({
      _id: req.params.id,
      organization: req.organization._id,
    });

    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found.' });
    }

    const tasks = await Task.find({ sprint: sprint._id });
    const completedTasks = tasks.filter((t) => t.status === 'Done');
    const velocity = completedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    sprint.status = 'Completed';
    sprint.velocity = velocity;
    await sprint.save();

    // Move uncompleted tasks to Backlog
    const incompleteTasks = tasks.filter((t) => t.status !== 'Done');
    await Task.updateMany(
      { _id: { $in: incompleteTasks.map((t) => t._id) } },
      { $unset: { sprint: 1 } }
    );

    await logActivity({
      organizationId: req.organization._id,
      userId: req.user._id,
      action: 'SPRINT_COMPLETED',
      entityType: 'Sprint',
      entityId: sprint._id.toString(),
      details: { name: sprint.name, velocity, completedTasks: completedTasks.length },
    });

    res.json({
      success: true,
      message: `Sprint '${sprint.name}' completed with velocity of ${velocity} points.`,
      sprint,
      rolledOverTasksCount: incompleteTasks.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete sprint
// @route   DELETE /api/sprints/:id
export const deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findOneAndDelete({
      _id: req.params.id,
      organization: req.organization._id,
    });

    if (!sprint) {
      return res.status(404).json({ success: false, message: 'Sprint not found.' });
    }

    // Detach sprint from tasks
    await Task.updateMany({ sprint: sprint._id }, { $unset: { sprint: 1 } });

    res.json({
      success: true,
      message: 'Sprint deleted and tasks moved to backlog.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
