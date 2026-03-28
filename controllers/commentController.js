const notifyUser = require("../utils/notifyUser");
const { moderateComment } = require("../services/moderationService");

exports.createComment = async (req, res) => {
  const userId = req.session.user._id;
  const projectId = req.body.projectId;
  const commentText = req.body.text;

  // Moderate comment before saving
  const { flagged, reason } = await moderateComment(commentText);
  if (flagged) {
    return res.status(400).json({ success: false, message: reason });
  }

  const project = await Project.findById(projectId);

  notifyUser(project.uploaderId, {
    projectName: project.projectName,
    type: "comment",
    timestamp: new Date()
  });

  res.json({ success: true });
};
