export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.orgRole) {
      return res.status(403).json({
        success: false,
        message: 'Role permissions could not be evaluated without organization context.',
      });
    }

    // Owner always has all privileges
    if (req.orgRole === 'Owner' || allowedRoles.includes(req.orgRole)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied: Role '${req.orgRole}' does not have sufficient permissions for this action. Allowed: [${allowedRoles.join(', ')}]`,
    });
  };
};
