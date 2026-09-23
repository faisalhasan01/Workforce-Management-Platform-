import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { logActivity } from '../utils/auditLogger.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'nexus_super_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user & create initial organization
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, orgName, jobTitle } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      jobTitle: jobTitle || 'Team Lead',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    });

    // Create default organization for new user
    const organizationName = orgName || `${name.split(' ')[0]}'s Workspace`;
    const slug = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.random().toString(36).substring(2, 6);

    const organization = await Organization.create({
      name: organizationName,
      slug,
      owner: user._id,
      plan: 'Enterprise',
    });

    user.organizations = [
      {
        organization: organization._id,
        role: 'Owner',
      },
    ];
    user.activeOrganization = organization._id;
    await user.save();

    await logActivity({
      organizationId: organization._id,
      userId: user._id,
      action: 'USER_REGISTERED',
      entityType: 'Auth',
      entityId: user._id.toString(),
      details: { email: user.email, orgName: organization.name },
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account and organization created successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        jobTitle: user.jobTitle,
        department: user.department,
        activeOrganization: organization._id,
        organizations: user.organizations,
      },
      organization,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password').populate('organizations.organization');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.activeOrganization && user.organizations.length > 0) {
      user.activeOrganization = user.organizations[0].organization._id || user.organizations[0].organization;
      await user.save();
    }

    const token = generateToken(user._id);

    if (user.activeOrganization) {
      await logActivity({
        organizationId: user.activeOrganization,
        userId: user._id,
        action: 'USER_LOGIN',
        entityType: 'Auth',
        entityId: user._id.toString(),
        details: { email: user.email },
      });
    }

    res.json({
      success: true,
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('organizations.organization');
    res.json({
      success: true,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, jobTitle, department, avatar, status } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (jobTitle) user.jobTitle = jobTitle;
    if (department) user.department = department;
    if (avatar) user.avatar = avatar;
    if (status) user.status = status;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: user.toSafeJSON(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    One-click instant demo login for assessment review
// @route   POST /api/auth/demo-login
export const demoLogin = async (req, res) => {
  try {
    const { role = 'Admin' } = req.body;
    let targetEmail = 'admin@enterprise.com';

    if (role === 'Project Manager') targetEmail = 'manager@enterprise.com';
    if (role === 'Team Member') targetEmail = 'dev@enterprise.com';
    if (role === 'Viewer') targetEmail = 'client@enterprise.com';

    let user = await User.findOne({ email: targetEmail }).populate('organizations.organization');

    // If demo user doesn't exist yet, fall back to any first available user
    if (!user) {
      user = await User.findOne().populate('organizations.organization');
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No demo accounts found. Please run seed script or register.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: `Logged in as Demo ${role} (${user.email})`,
      token,
      user: user.toSafeJSON(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
