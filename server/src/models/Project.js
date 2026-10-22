import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      minlength: [2, 'Project title must be at least 2 characters long'],
      maxlength: [100, 'Project title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    color: {
      type: String,
      default: '#4f46e5',
      match: [/^#([0-9a-fA-F]{3}){1,2}$/, 'Please provide a valid hex color code'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project owner is required'],
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Cascade delete: Remove all tasks associated with this project when removed
projectSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    await mongoose.model('Task').deleteMany({ project: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

export const Project = mongoose.model('Project', projectSchema);
export default Project;
