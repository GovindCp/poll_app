const mongoose = require('mongoose');

const { Schema } = mongoose;

const ArtifactSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['document', 'video', 'link', 'quiz', 'other'],
    default: 'document'
  },
  order: {
    type: Number,
    default: 0
  },
  url: {
    type: String
  },
  content: {
    type: String
  },
  estimatedDurationMins: {
    type: Number
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  _id: true,
  timestamps: false
});

ArtifactSchema.pre('validate', function(next) {
  if (!this.url && !this.content) {
    next(new Error('Artifact must include either a url or inline content'));
    return;
  }
  next();
});

const ModuleSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  estimatedDurationMins: {
    type: Number
  },
  artifacts: {
    type: [ArtifactSchema],
    validate: [
      {
        validator(value) {
          return Array.isArray(value) && value.length > 0;
        },
        message: 'At least one artifact is required for a module'
      }
    ]
  }
}, {
  timestamps: true
});

ModuleSchema.index({ title: 1, createdBy: 1 });

module.exports = mongoose.model('Module', ModuleSchema);
