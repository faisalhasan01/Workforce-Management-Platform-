import Organization from '../models/Organization.js';

export const requireTenant = async (req, res, next) => {
  try {
    let orgId = req.headers['x-organization-id'] || req.query.orgId;

    if (!orgId && req.user && req.user.activeOrganization) {
      orgId = req.user.activeOrganization.toString();
    }

    if (!orgId && req.user && req.user.organizations.length > 0) {
      orgId = req.user.organizations[0].organization._id
        ? req.user.organizations[0].organization._id.toString()
        : req.user.organizations[0].organization.toString();
    }

    if (!orgId) {
      return res.status(400).json({
        success: false,
        message: 'Organization context (x-organization-id) is required for this operation.',
      });
    }

    // Verify user belongs to this organization
    const orgMembership = req.user.organizations.find((o) => {
      const id = o.organization._id ? o.organization._id.toString() : o.organization.toString();
      return id === orgId.toString();
    });

    if (!orgMembership) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a member of this organization.',
      });
    }

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found.',
      });
    }

    req.organization = organization;
    req.orgRole = orgMembership.role;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify organization context.',
      error: error.message,
    });
  }
};
