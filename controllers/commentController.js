const notifyUser = require("../utils/notifyUser");

exports.createComment = async (req, res) => {
  const userId = req.session.user._id;
  const projectId = req.body.projectId;

  const project = await Project.findById(projectId);

  notifyUser(project.uploaderId, {
    projectName: project.projectName,
    type: "comment",
    timestamp: new Date()
  });

  res.json({ success: true });
};
