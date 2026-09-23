import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { logActivity } from '../utils/auditLogger.js';
import { getIO } from '../config/socket.js';

// @desc    Get all tasks with filtering
// @route   GET /api/tasks
export const getTasks = async (req, res) => {
  try {
    const { projectId, sprintId, status, priority, assigneeId, search } = req.query;
    const query = { organization: req.organization._id };

    if (projectId) query.project = projectId;
    if (sprintId) query.sprint = sprintId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assigneeId) query.assignee = assigneeId;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email avatar jobTitle')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key')
      .populate('sprint', 'name status')
      .populate('comments.user', 'name avatar email')
      .sort({ order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
export const createTask = async (req, res) => {
  try {
    const {
      projectId,
      sprintId,
      title,
      description,
      status = 'Todo',
      priority = 'Medium',
      storyPoints = 3,
      assigneeId,
      dueDate,
      tags = [],
      subtasks = [],
    } = req.body;

    if (!projectId || !title) {
      return res.status(400).json({ success: false, message: 'Project ID and title are required.' });
    }

    const project = await Project.findOne({
      _id: projectId,
      organization: req.organization._id,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found in your organization.' });
    }

    // Increment project counter to generate key e.g. ENG-101
    project.taskCounter = (project.taskCounter || 0) + 1;
    await project.save();

    const taskKey = `${project.key}-${project.taskCounter}`;

    // Calculate highest order in column
    const highestTask = await Task.findOne({
      project: projectId,
      status,
    }).sort({ order: -1 });

    const order = highestTask ? highestTask.order + 1 : 0;

    const task = await Task.create({
      organization: req.organization._id,
      project: projectId,
      sprint: sprintId || null,
      key: taskKey,
      title,
      description,
      status,
      priority,
      storyPoints,
      assignee: assigneeId || null,
      reporter: req.user._id,
      dueDate,
      tags,
      subtasks,
      order,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar jobTitle')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key');

    await logActivity({
      organizationId: req.organization._id,
      userId: req.user._id,
      action: 'TASK_CREATED',
      entityType: 'Task',
      entityId: task._id.toString(),
      details: { key: taskKey, title: task.title, project: project.name },
    });

    // Broadcast to real-time socket room
    try {
      const io = getIO();
      if (io) {
        io.to(`org:${req.organization._id}`).emit('task:created', populatedTask);
      }
    } catch (e) {
      // socket broadcast graceful fail
    }

    res.status(201).json({
      success: true,
      message: `Task ${taskKey} created.`,
      task: populatedTask,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, organization: req.organization._id },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('assignee', 'name email avatar jobTitle')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key')
      .populate('comments.user', 'name avatar email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await logActivity({
      organizationId: req.organization._id,
      userId: req.user._id,
      action: 'TASK_UPDATED',
      entityType: 'Task',
      entityId: task._id.toString(),
      details: { key: task.key, title: task.title, updates: req.body },
    });

    try {
      const io = getIO();
      if (io) {
        io.to(`org:${req.organization._id}`).emit('task:updated', task);
      }
    } catch (e) {}

    res.json({
      success: true,
      message: 'Task updated successfully.',
      task,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Move task across Kanban columns & update order
// @route   PUT /api/tasks/:id/move
export const moveTask = async (req, res) => {
  try {
    const { status, newOrder } = req.body;
    const task = await Task.findOne({
      _id: req.params.id,
      organization: req.organization._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const oldStatus = task.status;
    if (status) task.status = status;
    if (typeof newOrder === 'number') task.order = newOrder;

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar jobTitle')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key');

    await logActivity({
      organizationId: req.organization._id,
      userId: req.user._id,
      action: 'TASK_MOVED',
      entityType: 'Task',
      entityId: task._id.toString(),
      details: { key: task.key, from: oldStatus, to: status, order: newOrder },
    });

    try {
      const io = getIO();
      if (io) {
        io.to(`org:${req.organization._id}`).emit('task:moved', {
          taskId: task._id,
          task: populatedTask,
          oldStatus,
          newStatus: status,
          newOrder,
        });
      }
    } catch (e) {}

    res.json({
      success: true,
      message: `Task moved to ${status}`,
      task: populatedTask,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to a task
// @route   POST /api/tasks/:id/comments
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Comment text cannot be empty.' });
    }

    const task = await Task.findOne({
      _id: req.params.id,
      organization: req.organization._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    task.comments.push({
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date(),
    });

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('comments.user', 'name avatar email')
      .populate('assignee', 'name email avatar jobTitle');

    try {
      const io = getIO();
      if (io) {
        io.to(`org:${req.organization._id}`).emit('task:comment_added', {
          taskId: task._id,
          task: updatedTask,
        });
      }
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: 'Comment posted.',
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle subtask completion
// @route   PUT /api/tasks/:id/subtasks/:subtaskId
export const toggleSubtask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organization: req.organization._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    const subtask = task.subtasks.id(req.params.subtaskId);
    if (!subtask) {
      return res.status(404).json({ success: false, message: 'Subtask not found.' });
    }

    subtask.completed = !subtask.completed;
    subtask.completedAt = subtask.completed ? new Date() : null;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignee', 'name email avatar jobTitle')
      .populate('reporter', 'name email avatar')
      .populate('project', 'name key');

    try {
      const io = getIO();
      if (io) {
        io.to(`org:${req.organization._id}`).emit('task:updated', updatedTask);
      }
    } catch (e) {}

    res.json({
      success: true,
      message: 'Subtask toggled.',
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      organization: req.organization._id,
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await logActivity({
      organizationId: req.organization._id,
      userId: req.user._id,
      action: 'TASK_DELETED',
      entityType: 'Task',
      entityId: task._id.toString(),
      details: { key: task.key, title: task.title },
    });

    try {
      const io = getIO();
      if (io) {
        io.to(`org:${req.organization._id}`).emit('task:deleted', { taskId: task._id });
      }
    } catch (e) {}

    res.json({
      success: true,
      message: `Task ${task.key} deleted successfully.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
