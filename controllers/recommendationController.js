const Project = require('../models/uploadProject');
const User = require('../models/User');
const Like = require('../models/likes');
const View = require('../models/views');
const Comment = require('../models/comments');

/**
 * GET /api/recommendations
 * Returns personalized project recommendations for the logged-in user.
 *
 * Strategy:
 * 1. Collect projects the user has interacted with (liked, viewed, commented)
 * 2. Extract technologies from those projects as interest signals
 * 3. Find other users who interacted with the same projects (similar users)
 * 4. Score unseen projects by:
 *    - technology overlap with user's interests (+3 per match)
 *    - engagement by similar users (+2 per similar user interaction)
 *    - same program as user (+1)
 * 5. Return top N scored projects
 */
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit) || 10;

    const currentUser = await User.findById(userId).lean();
    if (!currentUser) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Step 1: Get all projects the user has already interacted with
    const [userLikes, userViews, userComments] = await Promise.all([
      Like.find({ userId }).lean(),
      View.find({ userId }).lean(),
      Comment.find({ userId }).lean()
    ]);

    const interactedProjectIds = new Set([
      ...userLikes.map(l => l.projectId.toString()),
      ...userViews.map(v => v.projectId.toString()),
      ...userComments.map(c => c.projectId.toString())
    ]);

    // Step 2: Get technologies from interacted projects (user's interest signals)
    const interactedProjects = await Project.find({
      _id: { $in: [...interactedProjectIds] }
    }).select('technologies').lean();

    const techInterests = new Set();
    interactedProjects.forEach(p => {
      p.technologies?.forEach(t => techInterests.add(t.toLowerCase()));
    });

    // Step 3: Find similar users — those who interacted with the same projects
    const [similarLikers, similarViewers, similarCommenters] = await Promise.all([
      Like.find({ projectId: { $in: [...interactedProjectIds] }, userId: { $ne: userId } }).lean(),
      View.find({ projectId: { $in: [...interactedProjectIds] }, userId: { $ne: userId } }).lean(),
      Comment.find({ projectId: { $in: [...interactedProjectIds] }, userId: { $ne: userId } }).lean()
    ]);

    // Map: projectId -> Set of similar userIds who engaged with it
    const similarUsersByProject = {};
    [...similarLikers, ...similarViewers, ...similarCommenters].forEach(({ userId: uid, projectId }) => {
      const pid = projectId.toString();
      if (!similarUsersByProject[pid]) similarUsersByProject[pid] = new Set();
      similarUsersByProject[pid].add(uid.toString());
    });

    const similarUserIds = new Set(
      [...similarLikers, ...similarViewers, ...similarCommenters].map(i => i.userId.toString())
    );

    // Step 4: Get projects engaged by similar users that the current user hasn't seen
    const [similarLikes, similarViews, similarComments] = await Promise.all([
      Like.find({ userId: { $in: [...similarUserIds] } }).lean(),
      View.find({ userId: { $in: [...similarUserIds] } }).lean(),
      Comment.find({ userId: { $in: [...similarUserIds] } }).lean()
    ]);

    // Candidate project IDs (not yet interacted by current user)
    const candidateIds = new Set([
      ...similarLikes.map(l => l.projectId.toString()),
      ...similarViews.map(v => v.projectId.toString()),
      ...similarComments.map(c => c.projectId.toString())
    ]);
    interactedProjectIds.forEach(id => candidateIds.delete(id));

    // Also exclude projects owned by the current user
    const ownProjects = await Project.find({ userId }).select('_id').lean();
    ownProjects.forEach(p => candidateIds.delete(p._id.toString()));

    // If no candidates from similar users, fall back to tech-based candidates
    if (candidateIds.size === 0 && techInterests.size > 0) {
      const techProjects = await Project.find({
        technologies: { $in: [...techInterests] },
        userId: { $ne: userId }
      }).select('_id').lean();
      techProjects.forEach(p => {
        if (!interactedProjectIds.has(p._id.toString())) {
          candidateIds.add(p._id.toString());
        }
      });
    }

    // Final fallback: return trending projects if still empty
    if (candidateIds.size === 0) {
      const trending = await getTrending(userId, interactedProjectIds, limit);
      return res.json({ success: true, recommendations: trending, type: 'trending' });
    }

    // Step 5: Fetch candidate projects with their owners
    const candidateProjects = await Project.find({
      _id: { $in: [...candidateIds] }
    }).lean();

    const ownerIds = [...new Set(candidateProjects.map(p => p.userId.toString()))];
    const owners = await User.find({ _id: { $in: ownerIds } }).select('program year').lean();
    const ownerMap = {};
    owners.forEach(u => { ownerMap[u._id.toString()] = u; });

    // Build similar user engagement counts per project
    const similarEngagement = {};
    [...similarLikes, ...similarViews, ...similarComments].forEach(({ projectId }) => {
      const pid = projectId.toString();
      similarEngagement[pid] = (similarEngagement[pid] || 0) + 1;
    });

    // Score each candidate
    const scored = candidateProjects.map(project => {
      const pid = project._id.toString();
      const owner = ownerMap[project.userId.toString()] || {};
      let score = 0;

      // Technology overlap
      project.technologies?.forEach(t => {
        if (techInterests.has(t.toLowerCase())) score += 3;
      });

      // Similar user engagement
      score += (similarEngagement[pid] || 0) * 2;

      // Same program bonus
      if (owner.program === currentUser.program) score += 1;

      return {
        projectId: pid,
        name: project.name,
        description: project.description,
        technologies: project.technologies,
        thumbnailUrl: project.thumbnailUrl?.url || '',
        program: owner.program || '',
        yearLevel: owner.year || '',
        score
      };
    });

    // Sort by score descending, return top N
    scored.sort((a, b) => b.score - a.score);
    const recommendations = scored.slice(0, limit);

    return res.json({ success: true, recommendations, type: 'personalized' });
  } catch (err) {
    console.error('Recommendation error:', err);
    return res.status(500).json({ success: false, error: 'Failed to get recommendations' });
  }
};

// Fallback: return top projects by likes + views that user hasn't seen
async function getTrending(userId, excludeIds, limit) {
  const allProjects = await Project.find({ userId: { $ne: userId } }).lean();
  const projectIds = allProjects.map(p => p._id);

  const [likes, views] = await Promise.all([
    Like.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } }
    ]),
    View.aggregate([
      { $match: { projectId: { $in: projectIds } } },
      { $group: { _id: '$projectId', count: { $sum: 1 } } }
    ])
  ]);

  const stats = {};
  likes.forEach(({ _id, count }) => { stats[_id.toString()] = (stats[_id.toString()] || 0) + count; });
  views.forEach(({ _id, count }) => { stats[_id.toString()] = (stats[_id.toString()] || 0) + count; });

  return allProjects
    .filter(p => !excludeIds.has(p._id.toString()))
    .map(p => ({
      projectId: p._id.toString(),
      name: p.name,
      description: p.description,
      technologies: p.technologies,
      thumbnailUrl: p.thumbnailUrl?.url || '',
      score: stats[p._id.toString()] || 0
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
