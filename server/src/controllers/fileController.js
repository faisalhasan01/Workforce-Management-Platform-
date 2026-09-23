import Document from '../models/Document.js';
import { logActivity } from '../utils/auditLogger.js';
import fs from 'fs';
import path from 'path';

// @desc    Get all documents for organization
// @route   GET /api/files
export const getDocuments = async (req, res) => {
  try {
    const { category, projectId, search } = req.query;
    const query = { organization: req.organization._id };

    if (category && category !== 'All') query.category = category;
    if (projectId) query.project = projectId;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { fileName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const documents = await Document.find(query)
      .populate('uploadedBy', 'name email avatar')
      .populate('project', 'name key')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload new document or asset
// @route   POST /api/files/upload
export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload.' });
    }

    const { title, category = 'General', projectId, tags } = req.body;

    const parsedTags = typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : tags || [];

    const fileUrl = `/uploads/${req.file.filename}`;

    const doc = await Document.create({
      organization: req.organization._id,
      project: projectId || null,
      title: title || req.file.originalname,
      fileName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      category,
      uploadedBy: req.user._id,
      tags: parsedTags,
    });

    const populatedDoc = await Document.findById(doc._id)
      .populate('uploadedBy', 'name email avatar')
      .populate('project', 'name key');

    await logActivity({
      organizationId: req.organization._id,
      userId: req.user._id,
      action: 'FILE_UPLOADED',
      entityType: 'Document',
      entityId: doc._id.toString(),
      details: { title: doc.title, fileName: doc.fileName, size: doc.fileSize },
    });

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      document: populatedDoc,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a document
// @route   DELETE /api/files/:id
export const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({
      _id: req.params.id,
      organization: req.organization._id,
    });

    if (!doc) {
      return res.status(404).json({ success: false, message: 'Document not found.' });
    }

    // Try removing physical file
    try {
      const localFilePath = path.join(process.cwd(), 'uploads', path.basename(doc.fileUrl));
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    } catch (e) {}

    await logActivity({
      organizationId: req.organization._id,
      userId: req.user._id,
      action: 'FILE_DELETED',
      entityType: 'Document',
      entityId: doc._id.toString(),
      details: { title: doc.title, fileName: doc.fileName },
    });

    res.json({
      success: true,
      message: 'Document deleted successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
