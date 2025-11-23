const mongoose = require('mongoose');
const { Schema } = mongoose;

const LikeSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true }
  },
  { timestamps: true }
);

// Prevent user from liking the same project twice
LikeSchema.index({ userId: 1, projectId: 1 }, { unique: true });

module.exports = mongoose.model('Like', LikeSchema);
