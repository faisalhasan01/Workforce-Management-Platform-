import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    channel: {
      type: String,
      required: true,
      index: true,
      default: 'general',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [3000, 'Message cannot exceed 3000 characters'],
    },
    attachments: [
      {
        name: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ organization: 1, channel: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
