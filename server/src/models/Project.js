import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a project name'],
      trim: true,
      maxlength: [120, 'Project name cannot exceed 120 characters'],
    },
    key: {
      type: String,
      required: [true, 'Please provide a project key'],
      uppercase: true,
      trim: true,
      maxlength: [10, 'Key cannot exceed 10 characters'],
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Planning', 'Active', 'On Hold', 'Completed'],
      default: 'Active',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    budget: {
      type: Number,
      default: 50000,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    targetDate: {
      type: Date,
    },
    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    taskCounter: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

projectSchema.index({ organization: 1, key: 1 }, { unique: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;
