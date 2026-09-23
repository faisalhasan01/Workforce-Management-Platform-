import AuditLog from '../models/AuditLog.js';

export const logActivity = async ({
  organizationId,
  userId,
  action,
  entityType,
  entityId = '',
  details = {},
  ipAddress = '127.0.0.1',
}) => {
  try {
    await AuditLog.create({
      organization: organizationId,
      user: userId,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
    });
  } catch (err) {
    console.error('[AuditLogger] Failed to write audit record:', err.message);
  }
};
