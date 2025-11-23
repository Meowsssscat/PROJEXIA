const notifyUser = require("../utils/notifyUser");

exports.likeProject = async (req, res) => {
  const userId = req.session.user._id;
  const projectId = req.body.projectId;

  const project = await Project.findById(projectId);

  // Notify project owner
  notifyUser(project.uploaderId, {
    projectName: project.projectName,
    type: "like",
    timestamp: new Date()
  });

  res.json({ success: true });
};
