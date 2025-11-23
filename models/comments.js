const mongoose = require('mongoose');
const { Schema } = mongoose;

const CommentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    text: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', CommentSchema);
