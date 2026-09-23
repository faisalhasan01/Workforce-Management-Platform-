import Organization from '../models/Organization.js';
import User from '../models/User.js';
import { logActivity } from '../utils/auditLogger.js';

// @desc    Get user's organizations
// @route   GET /api/orgs
export const getUserOrgs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('organizations.organization');
    res.json({
      success: true,
      organizations: user.organizations,
      activeOrganization: user.activeOrganization,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new organization
// @route   POST /api/orgs
export const createOrg = async (req, res) => {
  try {
    const { name, plan = 'Enterprise' } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Please provide an organization name.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const organization = await Organization.create({
      name,
      slug,
      owner: req.user._id,
      plan,
    });

    const user = await User.findById(req.user._id);
    user.organizations.push({
      organization: organization._id,
      role: 'Owner',
    });
    user.activeOrganization = organization._id;
    await user.save();

    await logActivity({
      organizationId: organization._id,
      userId: req.user._id,
      action: 'ORGANIZATION_CREATED',
      entityType: 'Organization',
      entityId: organization._id.toString(),
      details: { name: organization.name, plan: organization.plan },
    });

    res.status(201).json({
      success: true,
      message: 'Organization created successfully.',
      organization,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Switch user active organization
// @route   POST /api/orgs/:id/switch
export const switchActiveOrg = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id);
    const hasAccess = user.organizations.some(
      (o) => o.organization.toString() === id.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'You are not a member of this organization.',
      });
    }

    user.activeOrganization = id;
    await user.save();

    const organization = await Organization.findById(id);

    await logActivity({
      organizationId: id,
      userId: user._id,
      action: 'TENANT_SWITCHED',
      entityType: 'Organization',
      entityId: id,
      details: { orgName: organization.name },
    });

    res.json({
      success: true,
      message: `Switched active organization to ${organization.name}`,
      activeOrganization: organization,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all members in the current organization
// @route   GET /api/orgs/:id/members
export const getOrgMembers = async (req, res) => {
  try {
    const { id } = req.params;

    // Find all users who have this organization in their organizations array
    const users = await User.find({
      'organizations.organization': id,
    }).select('-password');

    const formattedMembers = users.map((u) => {
      const orgRecord = u.organizations.find(
        (o) => o.organization.toString() === id.toString()
      );
      return {
        _id: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        jobTitle: u.jobTitle,
        department: u.department,
        status: u.status,
        role: orgRecord ? orgRecord.role : 'Team Member',
        joinedAt: orgRecord ? orgRecord.joinedAt : u.createdAt,
      };
    });

    res.json({
      success: true,
      count: formattedMembers.length,
      members: formattedMembers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add or invite a member to organization
// @route   POST /api/orgs/:id/members
export const addOrgMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role = 'Team Member', name, jobTitle } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide user email.' });
    }

    let targetUser = await User.findOne({ email });

    if (!targetUser) {
      // Auto-provision invited member
      targetUser = await User.create({
        name: name || email.split('@')[0],
        email,
        password: 'Password123!',
        jobTitle: jobTitle || 'Team Member',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
        organizations: [
          {
            organization: id,
            role,
          },
        ],
        activeOrganization: id,
      });
    } else {
      // Check if already member
      const exists = targetUser.organizations.some(
        (o) => o.organization.toString() === id.toString()
      );
      if (exists) {
        return res.status(400).json({ success: false, message: 'User is already a member of this organization.' });
      }

      targetUser.organizations.push({
        organization: id,
        role,
      });
      await targetUser.save();
    }

    await logActivity({
      organizationId: id,
      userId: req.user._id,
      action: 'MEMBER_ADDED',
      entityType: 'User',
      entityId: targetUser._id.toString(),
      details: { addedUserEmail: targetUser.email, role },
    });

    res.status(201).json({
      success: true,
      message: `User ${targetUser.email} added with role ${role}.`,
      member: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        avatar: targetUser.avatar,
        jobTitle: targetUser.jobTitle,
        department: targetUser.department,
        role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a member's role
// @route   PUT /api/orgs/:id/members/:userId/role
export const updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;

    if (!['Owner', 'Admin', 'Project Manager', 'Team Member', 'Viewer'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const orgRecord = targetUser.organizations.find(
      (o) => o.organization.toString() === id.toString()
    );

    if (!orgRecord) {
      return res.status(404).json({ success: false, message: 'User is not part of this organization.' });
    }

    const oldRole = orgRecord.role;
    orgRecord.role = role;
    await targetUser.save();

    await logActivity({
      organizationId: id,
      userId: req.user._id,
      action: 'MEMBER_ROLE_UPDATED',
      entityType: 'User',
      entityId: userId,
      details: { member: targetUser.email, oldRole, newRole: role },
    });

    res.json({
      success: true,
      message: `Role updated to ${role} for ${targetUser.name}`,
      member: {
        _id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
