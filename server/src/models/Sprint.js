import mongoose from 'mongoose';

const sprintSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a sprint name'],
      trim: true,
    },
    goal: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Backlog', 'Active', 'Completed'],
      default: 'Backlog',
    },
    velocity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Sprint = mongoose.model('Sprint', sprintSchema);
export default Sprint;
