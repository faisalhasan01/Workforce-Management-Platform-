import AuditLog from '../models/AuditLog.js';

// @desc    Get audit logs for the organization
// @route   GET /api/audit
export const getAuditLogs = async (req, res) => {
  try {
    const { action, entityType, limit = 50, page = 1 } = req.query;
    const query = { organization: req.organization._id };

    if (action) query.action = action;
    if (entityType) query.entityType = entityType;

    const skip = (Number(page) - 1) * Number(limit);

    const logs = await AuditLog.find(query)
      .populate('user', 'name email avatar jobTitle')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
