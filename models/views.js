const mongoose = require('mongoose');
const { Schema } = mongoose;

const ViewSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true }
  },
  { timestamps: true }
);

// So each user can only have 1 view record per project
ViewSchema.index({ userId: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model('View', ViewSchema);
