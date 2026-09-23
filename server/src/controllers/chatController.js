import Message from '../models/Message.js';
import Project from '../models/Project.js';
import { getIO } from '../config/socket.js';

// @desc    Get channel list for organization
// @route   GET /api/chat/channels
export const getChannels = async (req, res) => {
  try {
    const projects = await Project.find({ organization: req.organization._id }).select('name key');

    const defaultChannels = [
      { id: 'general', name: 'general', description: 'Company-wide team updates and chatter', isProject: false },
      { id: 'engineering', name: 'engineering', description: 'Architecture, PRs, and tech discussions', isProject: false },
      { id: 'announcements', name: 'announcements', description: 'Sprint goals, releases, and key announcements', isProject: false },
    ];

    const projectChannels = projects.map((p) => ({
      id: `project-${p._id}`,
      name: `proj-${p.key.toLowerCase()}`,
      description: `Project discussions for ${p.name}`,
      isProject: true,
      projectId: p._id,
    }));

    res.json({
      success: true,
      channels: [...defaultChannels, ...projectChannels],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get messages for a channel
// @route   GET /api/chat/channels/:channel/messages
export const getChannelMessages = async (req, res) => {
  try {
    const { channel } = req.params;
    const { limit = 50 } = req.query;

    const messages = await Message.find({
      organization: req.organization._id,
      channel,
    })
      .populate('sender', 'name email avatar jobTitle')
      .sort({ createdAt: 1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Post message to channel
// @route   POST /api/chat/channels/:channel/messages
export const postMessage = async (req, res) => {
  try {
    const { channel } = req.params;
    const { content, attachments } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
    }

    const message = await Message.create({
      organization: req.organization._id,
      channel,
      sender: req.user._id,
      content: content.trim(),
      attachments: attachments || [],
    });

    const populatedMessage = await Message.findById(message._id).populate(
      'sender',
      'name email avatar jobTitle'
    );

    // Emit live to socket room
    try {
      const io = getIO();
      if (io) {
        io.to(`channel:${req.organization._id}:${channel}`).emit('chat:message', populatedMessage);
      }
    } catch (e) {}

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
