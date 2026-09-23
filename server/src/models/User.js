import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    jobTitle: {
      type: String,
      default: 'Full-Stack Engineer',
    },
    department: {
      type: String,
      default: 'Engineering',
    },
    status: {
      type: String,
      enum: ['Active', 'Away', 'Offline'],
      default: 'Active',
    },
    organizations: [
      {
        organization: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Organization',
          required: true,
        },
        role: {
          type: String,
          enum: ['Owner', 'Admin', 'Project Manager', 'Team Member', 'Viewer'],
          default: 'Team Member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    activeOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
