import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Sprint from '../models/Sprint.js';
import User from '../models/User.js';

// @desc    Get executive dashboard metrics
// @route   GET /api/analytics/dashboard
export const getDashboardAnalytics = async (req, res) => {
  try {
    const orgId = req.organization._id;

    const [totalProjects, totalTasks, completedTasks, inProgressTasks, totalSprints, activeSprints] =
      await Promise.all([
        Project.countDocuments({ organization: orgId }),
        Task.countDocuments({ organization: orgId }),
        Task.countDocuments({ organization: orgId, status: 'Done' }),
        Task.countDocuments({ organization: orgId, status: 'In Progress' }),
        Sprint.countDocuments({ organization: orgId }),
        Sprint.countDocuments({ organization: orgId, status: 'Active' }),
      ]);

    // Calculate story points completed vs total
    const allTasks = await Task.find({ organization: orgId }).select('storyPoints status priority assignee');
    const totalPoints = allTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedPoints = allTasks
      .filter((t) => t.status === 'Done')
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Status breakdown
    const statusMap = {
      Backlog: 0,
      Todo: 0,
      'In Progress': 0,
      'In Review': 0,
      Done: 0,
    };
    allTasks.forEach((t) => {
      if (statusMap[t.status] !== undefined) {
        statusMap[t.status]++;
      }
    });

    // Priority breakdown
    const priorityMap = {
      Low: 0,
      Medium: 0,
      High: 0,
      Urgent: 0,
    };
    allTasks.forEach((t) => {
      if (priorityMap[t.priority] !== undefined) {
        priorityMap[t.priority]++;
      }
    });

    // Sprints velocity history
    const pastSprints = await Sprint.find({ organization: orgId })
      .sort({ createdAt: -1 })
      .limit(6);

    const velocityTrend = pastSprints.reverse().map((s) => ({
      name: s.name,
      velocity: s.velocity || 0,
      status: s.status,
    }));

    // Member workload
    const members = await User.find({ 'organizations.organization': orgId }).select('name avatar jobTitle');
    const workload = members.map((m) => {
      const userTasks = allTasks.filter((t) => t.assignee && t.assignee.toString() === m._id.toString());
      const done = userTasks.filter((t) => t.status === 'Done').length;
      return {
        userId: m._id,
        name: m.name,
        avatar: m.avatar,
        jobTitle: m.jobTitle,
        assignedTasks: userTasks.length,
        completedTasks: done,
        inProgressTasks: userTasks.length - done,
      };
    });

    res.json({
      success: true,
      metrics: {
        totalProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        totalSprints,
        activeSprints,
        totalPoints,
        completedPoints,
        overallProgress,
      },
      statusDistribution: Object.entries(statusMap).map(([name, value]) => ({ name, value })),
      priorityDistribution: Object.entries(priorityMap).map(([name, value]) => ({ name, value })),
      velocityTrend,
      teamWorkload: workload,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
