const express = require('express');
const router = express.Router();
const Project = require('../models/uploadProject');
const User = require('../models/User');
const Like = require('../models/likes');
const View = require('../models/views');
const Comment = require('../models/comments');

// --- Optional Bearer token auth ---
const AI_TOOLS_TOKEN = process.env.AI_TOOLS_TOKEN;

function authMiddleware(req, res, next) {
  if (!AI_TOOLS_TOKEN) return next(); // no token configured = public
  const auth = req.headers['authorization'] || '';
  if (auth === `Bearer ${AI_TOOLS_TOKEN}`) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

router.use(authMiddleware);

// Helper: build project URL
const projectUrl = (id) => `/project/${id}`;
const profileUrl = (id) => `/visit/profile/${id}`;

// -------------------------------------------------------
// 1. GET /api/ai-tools/projects/similar?project_id=&limit=
// -------------------------------------------------------
router.get('/projects/similar', async (req, res) => {
  const { project_id, limit = 5 } = req.query;
  if (!project_id) return res.status(400).json({ error: 'project_id is required' });

  const source = await Project.findById(project_id).lean();
  if (!source) return res.status(404).json({ error: 'Project not found' });

  const similar = await Project.find({
    _id: { $ne: source._id },
    technologies: { $in: source.technologies }
  })
    .limit(parseInt(limit))
    .lean();

  res.json({
    projects: similar.map(p => ({
      id: p._id,
      name: p.name,
      description: p.description || '',
      tags: p.technologies || [],
      url: projectUrl(p._id)
    }))
  });
});

// -------------------------------------------------------
// 2. GET /api/ai-tools/projects/search?tech_stack=react,nodejs&limit=10
// -------------------------------------------------------
router.get('/projects/search', async (req, res) => {
  const { tech_stack, limit = 10 } = req.query;

  let filter = {};
  if (tech_stack) {
    const techs = tech_stack.split(',').map(t => t.trim()).filter(Boolean);
    filter.technologies = { $in: techs.map(t => new RegExp(t, 'i')) };
  }

  const projects = await Project.find(filter).limit(parseInt(limit)).lean();

  res.json({
    projects: projects.map(p => ({
      id: p._id,
      name: p.name,
      description: p.description || '',
      tech_stack: p.technologies || [],
      url: projectUrl(p._id)
    }))
  });
});

// -------------------------------------------------------
// 3. GET /api/ai-tools/projects/:id
// -------------------------------------------------------
router.get('/projects/:id', async (req, res) => {
  const project = await Project.findById(req.params.id).lean();
  if (!project) return res.status(404).json({ error: 'Project not found' });

  res.json({
    id: project._id,
    name: project.name,
    description: project.description || '',
    tech_stack: project.technologies || [],
    tags: project.technologies || [],
    readme_summary: project.description || '',
    url: projectUrl(project._id),
    github_url: project.githubLink || null,
    website_url: project.websiteLink || null,
    created_at: project.createdAt
  });
});

// -------------------------------------------------------
// 4. GET /api/ai-tools/contributors/top?period=month&limit=10
// -------------------------------------------------------
router.get('/contributors/top', async (req, res) => {
  const { period = 'month', limit = 10 } = req.query;

  // Build date filter
  let dateFilter = {};
  const now = new Date();
  if (period === 'week') {
    dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
  } else if (period === 'month') {
    dateFilter = { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } };
  }
  // 'all-time' = no date filter

  // Aggregate likes received per project owner
  const pipeline = [
    ...(Object.keys(dateFilter).length ? [{ $match: dateFilter }] : []),
    {
      $lookup: {
        from: 'allprojects',
        localField: 'projectId',
        foreignField: '_id',
        as: 'project'
      }
    },
    { $unwind: '$project' },
    { $group: { _id: '$project.userId', contributions: { $sum: 1 } } },
    { $sort: { contributions: -1 } },
    { $limit: parseInt(limit) }
  ];

  const results = await Like.aggregate(pipeline);
  const userIds = results.map(r => r._id);
  const users = await User.find({ _id: { $in: userIds } })
    .select('fullName profilePicture program year')
    .lean();

  const userMap = {};
  users.forEach(u => { userMap[u._id.toString()] = u; });

  res.json({
    period,
    contributors: results.map(r => {
      const u = userMap[r._id?.toString()] || {};
      return {
        username: u.fullName || 'Unknown',
        avatar_url: u.profilePicture?.url || null,
        contributions: r.contributions,
        profile_url: profileUrl(r._id)
      };
    })
  });
});

// -------------------------------------------------------
// 5. GET /api/ai-tools/recommendations?user_id=&limit=10
// -------------------------------------------------------
router.get('/recommendations', async (req, res) => {
  const { user_id, limit = 10 } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  const currentUser = await User.findById(user_id).lean();
  if (!currentUser) return res.status(404).json({ error: 'User not found' });

  const lim = parseInt(limit);

  // Step 1: projects the user already interacted with
  const [userLikes, userViews, userComments] = await Promise.all([
    Like.find({ userId: user_id }).lean(),
    View.find({ userId: user_id }).lean(),
    Comment.find({ userId: user_id }).lean()
  ]);

  const interactedIds = new Set([
    ...userLikes.map(l => l.projectId.toString()),
    ...userViews.map(v => v.projectId.toString()),
    ...userComments.map(c => c.projectId.toString())
  ]);

  // Step 2: tech interests from interacted projects
  const interactedProjects = await Project.find({ _id: { $in: [...interactedIds] } }).select('technologies').lean();
  const techInterests = new Set();
  interactedProjects.forEach(p => p.technologies?.forEach(t => techInterests.add(t.toLowerCase())));

  // Step 3: similar users
  const [simLikers, simViewers, simCommenters] = await Promise.all([
    Like.find({ projectId: { $in: [...interactedIds] }, userId: { $ne: user_id } }).lean(),
    View.find({ projectId: { $in: [...interactedIds] }, userId: { $ne: user_id } }).lean(),
    Comment.find({ projectId: { $in: [...interactedIds] }, userId: { $ne: user_id } }).lean()
  ]);

  const similarUserIds = new Set([...simLikers, ...simViewers, ...simCommenters].map(i => i.userId.toString()));

  // Step 4: candidate projects from similar users
  const [simLikes, simViews, simComments] = await Promise.all([
    Like.find({ userId: { $in: [...similarUserIds] } }).lean(),
    View.find({ userId: { $in: [...similarUserIds] } }).lean(),
    Comment.find({ userId: { $in: [...similarUserIds] } }).lean()
  ]);

  const candidateIds = new Set([
    ...simLikes.map(l => l.projectId.toString()),
    ...simViews.map(v => v.projectId.toString()),
    ...simComments.map(c => c.projectId.toString())
  ]);
  interactedIds.forEach(id => candidateIds.delete(id));

  const ownProjects = await Project.find({ userId: user_id }).select('_id').lean();
  ownProjects.forEach(p => candidateIds.delete(p._id.toString()));

  // Fallback: tech-based candidates
  if (candidateIds.size === 0 && techInterests.size > 0) {
    const techProjects = await Project.find({
      technologies: { $in: [...techInterests] },
      userId: { $ne: user_id }
    }).select('_id').lean();
    techProjects.forEach(p => {
      if (!interactedIds.has(p._id.toString())) candidateIds.add(p._id.toString());
    });
  }

  // Final fallback: trending
  if (candidateIds.size === 0) {
    const allProjects = await Project.find({ userId: { $ne: user_id } }).lean();
    const pIds = allProjects.map(p => p._id);
    const [tLikes, tViews] = await Promise.all([
      Like.aggregate([{ $match: { projectId: { $in: pIds } } }, { $group: { _id: '$projectId', count: { $sum: 1 } } }]),
      View.aggregate([{ $match: { projectId: { $in: pIds } } }, { $group: { _id: '$projectId', count: { $sum: 1 } } }])
    ]);
    const stats = {};
    [...tLikes, ...tViews].forEach(({ _id, count }) => { stats[_id.toString()] = (stats[_id.toString()] || 0) + count; });

    const trending = allProjects
      .filter(p => !interactedIds.has(p._id.toString()))
      .map(p => ({ projectId: p._id, name: p.name, description: p.description || '', technologies: p.technologies || [], thumbnailUrl: p.thumbnailUrl?.url || '', score: stats[p._id.toString()] || 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, lim);

    return res.json({ success: true, type: 'trending', recommendations: trending });
  }

  // Step 5: score candidates
  const candidates = await Project.find({ _id: { $in: [...candidateIds] } }).lean();
  const ownerIds = [...new Set(candidates.map(p => p.userId.toString()))];
  const owners = await User.find({ _id: { $in: ownerIds } }).select('program year').lean();
  const ownerMap = {};
  owners.forEach(u => { ownerMap[u._id.toString()] = u; });

  const simEngagement = {};
  [...simLikes, ...simViews, ...simComments].forEach(({ projectId }) => {
    const pid = projectId.toString();
    simEngagement[pid] = (simEngagement[pid] || 0) + 1;
  });

  const scored = candidates.map(p => {
    const pid = p._id.toString();
    const owner = ownerMap[p.userId.toString()] || {};
    let score = 0;
    p.technologies?.forEach(t => { if (techInterests.has(t.toLowerCase())) score += 3; });
    score += (simEngagement[pid] || 0) * 2;
    if (owner.program === currentUser.program) score += 1;
    return { projectId: pid, name: p.name, description: p.description || '', technologies: p.technologies || [], thumbnailUrl: p.thumbnailUrl?.url || '', program: owner.program || '', yearLevel: owner.year || '', score };
  });

  scored.sort((a, b) => b.score - a.score);

  res.json({ success: true, type: 'personalized', recommendations: scored.slice(0, lim) });
});

module.exports = router;
