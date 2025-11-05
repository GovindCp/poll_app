const mongoose = require('mongoose');

const { Schema } = mongoose;

const ArtifactProgressSchema = new Schema({
  artifactId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  completedAt: {
    type: Date
  }
}, {
  _id: false
});

const AssignmentSchema = new Schema({
  module: {
    type: Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['assigned', 'in_progress', 'completed', 'overdue'],
    default: 'assigned',
    index: true
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  notes: {
    type: String
  },
  artifactProgress: {
    type: [ArtifactProgressSchema],
    default: []
  },
  progressSnapshot: {
    completedArtifacts: {
      type: Number,
      default: 0
    },
    totalArtifacts: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

AssignmentSchema.index({ module: 1, user: 1, status: 1 });
AssignmentSchema.index({ user: 1, dueDate: 1 });

module.exports = mongoose.model('Assignment', AssignmentSchema);
