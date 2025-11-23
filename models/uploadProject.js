const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProjectSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    developers: { type: [String], default: [] },
    technologies: { type: [String], default: [] },

    // Store both URL and Cloudinary public_id
    thumbnailUrl: {
      url: { type: String, default: '' },
      public_id: { type: String, default: '' }
    },
    otherImages: [
      {
        url: { type: String, default: '' },
        public_id: { type: String, default: '' }
      }
    ],

    githubLink: { type: String, default: '' },
    websiteLink: { type: String, default: '' }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model('Project', ProjectSchema);
