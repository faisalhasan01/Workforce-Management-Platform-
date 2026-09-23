import Task from '../models/Task.js';

// @desc    Generate smart subtasks and acceptance criteria using AI engine
// @route   POST /api/ai/subtasks
export const generateSubtasks = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const t = (title + ' ' + (description || '')).toLowerCase();

    let generatedSubtasks = [];
    let acceptanceCriteria = [];
    let suggestedPoints = 3;

    if (t.includes('auth') || t.includes('login') || t.includes('jwt') || t.includes('sso')) {
      generatedSubtasks = [
        'Design secure schema with password hash salts and rate-limit counters',
        'Implement JWT token generation and refresh token rotation middleware',
        'Build frontend login/register form with client-side form validation',
        'Add session timeout and invalid token redirect handling',
        'Write integration tests for valid and invalid credential scenarios',
      ];
      acceptanceCriteria = [
        'Passwords must be hashed using bcrypt with salt factor >= 10',
        'JWT tokens expire within 7 days and fail gracefully',
        'Form displays inline human-readable error messages for 401/400 responses',
      ];
      suggestedPoints = 5;
    } else if (t.includes('chat') || t.includes('socket') || t.includes('realtime') || t.includes('message')) {
      generatedSubtasks = [
        'Establish Socket.IO room namespaces scoped by organization and channel',
        'Implement message persistence in MongoDB with sender population',
        'Create auto-scrolling chat window with optimistic message rendering',
        'Add active user presence indicators and typing status events',
        'Handle reconnects and connection drop gracefully',
      ];
      acceptanceCriteria = [
        'Messages broadcast to room members within 100ms',
        'Chat history persists across page reloads',
        'Users can send multiline messages and attachments',
      ];
      suggestedPoints = 8;
    } else if (t.includes('kanban') || t.includes('drag') || t.includes('board') || t.includes('card')) {
      generatedSubtasks = [
        'Define column state order array (Todo, In Progress, Review, Done)',
        'Implement optimistic UI card reorder on drop event',
        'Dispatch PUT /api/tasks/:id/move with updated status and order index',
        'Add socket broadcast so other active viewers see live card movement',
        'Add visual drop preview indicators and column task counters',
      ];
      acceptanceCriteria = [
        'Smooth 60fps drag and drop interaction without page stutter',
        'Task status persists in database after drag completion',
        'Other team members see card movements in real-time',
      ];
      suggestedPoints = 5;
    } else if (t.includes('report') || t.includes('export') || t.includes('analytics') || t.includes('chart')) {
      generatedSubtasks = [
        'Create MongoDB aggregation pipeline to compute sprint velocity and metrics',
        'Format data into structured CSV and JSON download streams',
        'Build printable PDF clean summary layout with project KPI cards',
        'Add client-side date range and project filter controls',
      ];
      acceptanceCriteria = [
        'Export file downloads immediately with proper MIME headers',
        'Reports reflect real-time task statuses and story points',
      ];
      suggestedPoints = 5;
    } else {
      generatedSubtasks = [
        `Analyze requirements and architectural specifications for "${title}"`,
        'Implement backend API endpoints with validation and error handling',
        'Create responsive frontend component with modern UI design tokens',
        'Integrate API client with loading and error states',
        'Perform end-to-end verification and code review',
      ];
      acceptanceCriteria = [
        'Implementation matches enterprise UI design system standards',
        'All CRUD operations function with 200/201 responses and proper error handling',
        'Responsive across desktop, tablet, and mobile displays',
      ];
      suggestedPoints = 3;
    }

    res.json({
      success: true,
      data: {
        taskTitle: title,
        subtasks: generatedSubtasks.map((st) => ({ title: st, completed: false })),
        acceptanceCriteria,
        suggestedStoryPoints: suggestedPoints,
        riskScore: suggestedPoints > 5 ? 'High Complexity' : 'Moderate',
        aiModel: 'Workforce Automation Engine',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate automated daily Agile standup summary
// @route   POST /api/ai/standup
export const generateDailyStandup = async (req, res) => {
  try {
    const orgId = req.organization._id;
    const userId = req.user._id;

    const completedTasks = await Task.find({
      organization: orgId,
      assignee: userId,
      status: 'Done',
    })
      .sort({ updatedAt: -1 })
      .limit(3);

    const activeTasks = await Task.find({
      organization: orgId,
      assignee: userId,
      status: { $in: ['In Progress', 'In Review', 'Todo'] },
    })
      .sort({ updatedAt: -1 })
      .limit(3);

    const yesterdayItems = completedTasks.length > 0
      ? completedTasks.map((t) => `Completed [${t.key}] ${t.title}`)
      : ['Reviewed project documentation and aligned on sprint goals'];

    const todayItems = activeTasks.length > 0
      ? activeTasks.map((t) => `Working on [${t.key}] ${t.title} (${t.status})`)
      : ['Investigating sprint backlog items and code reviews'];

    const blockers = ['No critical blockers. Dependent on QA verification for staging deployment.'];

    res.json({
      success: true,
      standup: {
        yesterday: yesterdayItems,
        today: todayItems,
        blockers,
        generatedAt: new Date().toISOString(),
        userName: req.user.name,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
