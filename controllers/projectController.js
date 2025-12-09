const Project = require('../models/uploadProject');
const User = require('../models/User');
const Comment = require('../models/comments');
const Like = require('../models/likes');
const View = require('../models/views');
const cloudinary = require('../config/cloudinaryConfig');

exports.getProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        console.log('🚀 GET PROJECT CALLED - ID:', projectId);
        
        // ========================================
        // GET PROJECT OBJECT
        // ========================================
        const projectObject = await Project.findById(projectId).lean();
        
        if (!projectObject) {
            return res.status(404).json({ error: 'Project not found' });
        }
         
        // ========================================
        // GET UPLOADER/USER OBJECT (Manual fetch to ensure track is included)
        // ========================================
        const userObject = await User.findById(projectObject.userId).lean();
        const userId = userObject._id.toString();
        
        // DEBUG: Log uploader info
        console.log('\n🔍 UPLOADER DEBUG:');
        console.log('Full Name:', userObject?.fullName);
        console.log('Program:', userObject?.program);
        console.log('Year:', userObject?.year);
        console.log('Track:', userObject?.track);
        console.log('Track exists?:', 'track' in userObject);
        console.log('Track value type:', typeof userObject?.track);
        console.log('Full User Object:', JSON.stringify(userObject, null, 2));
        console.log('================\n');
        
        // ========================================
        // 1. RETRIEVE ALL COMMENTS
        // ========================================
        console.log('=================================');
        console.log('📝 FETCHING COMMENTS FOR PROJECT:', projectId);
        console.log('=================================');
        const allComments = await Comment.find({ projectId: projectId })
            .populate('userId')
            .populate('replies.userId')
            .sort({ createdAt: -1 })
            .lean();
        
        console.log('📊 FOUND', allComments.length, 'COMMENTS');
        
        // DEBUG: Check what's in the populated comment
        if (allComments.length > 0) {
            console.log('🔍 FIRST COMMENT DEBUG:');
            console.log('Full userId object:', JSON.stringify(allComments[0].userId, null, 2));
            console.log('Has profilePicture field?', 'profilePicture' in allComments[0].userId);
        }
        
        // ========================================
        // 2. GET COMMENT COUNT (including replies)
        // ========================================
        const commentCount = allComments.reduce((total, comment) => {
            return total + 1 + (comment.replies?.length || 0);
        }, 0);
        
        // ========================================
        // 3. GET LIKE COUNT
        // ========================================
        const likeCount = await Like.countDocuments({ projectId: projectId });
        
        // ========================================
        // 4. GET VIEW COUNT
        // ========================================
        const viewCount = await View.countDocuments({ projectId: projectId });
        
        // ========================================
        // 5. GET WHO LIKED THE PROJECT (User IDs only)
        // ========================================
        const likesData = await Like.find({ projectId: projectId })
            .select('userId createdAt')
            .lean();
        
        const userIdsWhoLiked = likesData.map(like => like.userId.toString());
        
        // ========================================
        // 6. GET WHO LIKED THE PROJECT (With User Details)
        // ========================================
        const usersWhoLikedWithDetails = await Like.find({ projectId: projectId })
            .populate('userId', 'fullName email program year')
            .sort({ createdAt: -1 })
            .lean();
        
        // ========================================
        // 7. GET WHO VIEWED THE PROJECT (User IDs only)
        // ========================================
        const viewsData = await View.find({ projectId: projectId })
            .select('userId createdAt')
            .lean();
        
        const userIdsWhoViewed = viewsData.map(view => view.userId.toString());
        
        // ========================================
        // 8. GET WHO VIEWED THE PROJECT (With User Details)
        // ========================================
        const usersWhoViewedWithDetails = await View.find({ projectId: projectId })
            .populate('userId', 'fullName email program year')
            .sort({ createdAt: -1 })
            .lean();
        
        // ========================================
        // CHECK IF CURRENT USER IS THE UPLOADER
        // ========================================
        let isUploader = false;
        if (req.session && req.session.userId) {
            isUploader = projectObject.userId.toString() === req.session.userId.toString();
        }
        
        // ========================================
        // BONUS: Check if current user liked/viewed the project
        // ========================================
        let hasLiked = false;
        let hasViewed = false;
        
        if (req.session && req.session.userId) {
            hasLiked = await Like.exists({ 
                projectId: projectId, 
                userId: req.session.userId 
            });
            
            hasViewed = await View.exists({ 
                projectId: projectId, 
                userId: req.session.userId 
            });
        }
        
        // ========================================
        // LOG ALL DATA (for debugging)
        // ========================================
        console.log('=== PROJECT DATA ===');
        console.log('Project ID:', projectObject._id);
        console.log('Project Name:', projectObject.name);
        console.log('Project Program:', projectObject.program);
        console.log('Project Year Level:', projectObject.yearLevel);
        console.log('\n=== UPLOADER INFO ===');
        console.log('Uploader Full Name:', userObject?.fullName);
        console.log('Uploader Program:', userObject?.program);
        console.log('Uploader Year:', userObject?.year);
        console.log('Uploader Track:', userObject?.track);
        console.log('Full Uploader Object:', JSON.stringify(userObject, null, 2));
        console.log('Is Uploader:', isUploader);
        console.log('\n=== COMMENTS ===');
        console.log('All Comments:', allComments);
        console.log('Comment Count:', commentCount);
        console.log('\n=== LIKES ===');
        console.log('Like Count:', likeCount);
        console.log('User IDs Who Liked:', userIdsWhoLiked);
        console.log('Users Who Liked (Details):', usersWhoLikedWithDetails);
        console.log('\n=== VIEWS ===');
        console.log('View Count:', viewCount);
        console.log('User IDs Who Viewed:', userIdsWhoViewed);
        console.log('Users Who Viewed (Details):', usersWhoViewedWithDetails);
        console.log('\n=== CURRENT USER STATUS ===');
        console.log('Has Liked:', hasLiked);
        console.log('Has Viewed:', hasViewed);
        
        // ========================================
        // PASS ALL DATA TO FRONTEND
        // ========================================
        return res.render('project-detail-modern', {
            userId,
            project: projectObject,
            uploader: userObject,
            comments: allComments,
            commentCount,
            likeCount,
            viewCount,
            usersWhoLiked: usersWhoLikedWithDetails,
            usersWhoViewed: usersWhoViewedWithDetails,
            userIdsWhoLiked,
            userIdsWhoViewed,
            hasLiked: !!hasLiked,
            hasViewed: !!hasViewed,
            isUploader,
            currentUserId: req.session?.userId || null  // Pass current user ID for delete button check
        });
        
    } catch (error) {
        console.error('Error fetching project data:', error);
        return res.status(500).json({ error: 'Failed to fetch project data' });
    }
} 

// ========================================
// BONUS: Record a view when user visits
// ========================================
exports.recordView = async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'User not logged in' });
        }
        
        // Try to create a view record (will fail silently if already exists due to unique index)
        await View.create({ userId, projectId }).catch(() => {
            // View already exists, do nothing
        });
        
        return res.status(200).json({ success: true });
        
    } catch (error) {
        console.error('Error recording view:', error);
        return res.status(500).json({ error: 'Failed to record view' });
    }
}

// ========================================
// BONUS: Toggle like
// ========================================
exports.toggleLike = async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.session.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'User not logged in' });
        }
        
        // Get project and user info
        const project = await Project.findById(projectId);
        const user = await User.findById(userId);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Check if like exists
        const existingLike = await Like.findOne({ userId, projectId });
        
        if (existingLike) {
            // Unlike
            await Like.deleteOne({ _id: existingLike._id });
            const newLikeCount = await Like.countDocuments({ projectId });
            return res.status(200).json({ 
                liked: false, 
                likeCount: newLikeCount 
            });
        } else {
            // Like
            await Like.create({ userId, projectId });
            const newLikeCount = await Like.countDocuments({ projectId });
            
            // Send notification to project owner
            const notifyUser = require('../utils/notifyUser');
            await notifyUser(
                project.userId,
                userId,
                projectId,
                'like',
                `${user.fullName} liked your project "${project.name}"`
            );
            
            return res.status(200).json({ 
                liked: true, 
                likeCount: newLikeCount 
            });
        }
        
    } catch (error) {
        console.error('Error toggling like:', error);
        return res.status(500).json({ error: 'Failed to toggle like' });
    }
}

// ========================================
// BONUS: Add comment
// ========================================
exports.addComment = async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.session.userId;
        const { text } = req.body;
        
        if (!userId) {
            return res.status(401).json({ error: 'User not logged in' });
        }
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Comment text is required' });
        }
        
        // Get project and user info
        const project = await Project.findById(projectId);
        const user = await User.findById(userId);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Create comment
        const newComment = await Comment.create({
            userId,
            projectId,
            text: text.trim()
        });
        
        // Populate user details
        const populatedComment = await Comment.findById(newComment._id)
            .populate('userId')
            .lean();
        
        const newCommentCount = await Comment.countDocuments({ projectId });
        
        // Send notification to project owner
        const notifyUser = require('../utils/notifyUser');
        await notifyUser(
            project.userId,
            userId,
            projectId,
            'comment',
            `${user.fullName} commented on your project "${project.name}"`
        );
        
        return res.status(201).json({
            success: true,
            comment: populatedComment,
            commentCount: newCommentCount
        });
        
    } catch (error) {
        console.error('Error adding comment:', error);
        return res.status(500).json({ error: 'Failed to add comment' });
    }
}

// ========================================
// DELETE COMMENT
// ========================================
exports.deleteComment = async (req, res) => {
    try {
        const { projectId, commentId } = req.params;
        const userId = req.session?.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'User not logged in' });
        }
        
        // Find project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Find comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        // RULE: Only allow deletion if:
        // 1. User is the project owner OR
        // 2. User is the comment author
        if (project.userId.toString() !== userId.toString() && comment.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this comment' });
        }
        
        await Comment.findByIdAndDelete(commentId);
        
        // Return new comment count
        const newCommentCount = await Comment.countDocuments({ projectId });
        
        return res.status(200).json({ 
            success: true, 
            commentId, 
            commentCount: newCommentCount 
        });
        
    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.status(500).json({ error: 'Failed to delete comment' });
    }
}

// ========================================
// DELETE REPLY
// ========================================
exports.deleteReply = async (req, res) => {
    try {
        const { projectId, commentId, replyId } = req.params;
        const userId = req.session?.userId;
        
        if (!userId) {
            return res.status(401).json({ error: 'User not logged in' });
        }
        
        // Find project and comment
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        // Find the reply index
        const replyIndex = comment.replies.findIndex(r => r._id.toString() === replyId);
        if (replyIndex === -1) {
            return res.status(404).json({ error: 'Reply not found' });
        }
        
        const reply = comment.replies[replyIndex];
        
        // RULE: Only allow deletion if:
        // 1. User is the project owner OR
        // 2. User is the reply author
        if (project.userId.toString() !== userId.toString() && reply.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this reply' });
        }
        
        // Remove reply from comment using splice
        comment.replies.splice(replyIndex, 1);
        await comment.save();
        
        return res.status(200).json({ 
            success: true, 
            replyId 
        });
        
    } catch (error) {
        console.error('Error deleting reply:', error);
        return res.status(500).json({ error: 'Failed to delete reply' });
    }
}

// ========================================
// ADD REPLY TO COMMENT
// ========================================
exports.addReply = async (req, res) => {
    try {
        const { projectId, commentId } = req.params;
        const userId = req.session.userId;
        const { text } = req.body;
        
        if (!userId) {
            return res.status(401).json({ error: 'User not logged in' });
        }
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Reply text is required' });
        }
        
        // Get project, comment, and user info
        const project = await Project.findById(projectId);
        const comment = await Comment.findById(commentId);
        const user = await User.findById(userId);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }
        
        // Add reply to comment's replies array
        const reply = {
            userId,
            text: text.trim(),
            createdAt: new Date()
        };
        
        comment.replies.push(reply);
        await comment.save();
        
        // Populate user details for response
        const populatedComment = await Comment.findById(commentId)
            .populate('replies.userId', 'fullName email program year profilePicture')
            .lean();
        
        const addedReply = populatedComment.replies[populatedComment.replies.length - 1];
        
        // Send notification to comment author
        const notifyUser = require('../utils/notifyUser');
        
        // Make sure we're using the ID, not the populated object
        const commentAuthorId = comment.userId._id || comment.userId;
        
        console.log('=== REPLY NOTIFICATION DEBUG ===');
        console.log('Comment Author ID:', commentAuthorId);
        console.log('Reply Author ID:', userId);
        console.log('Project ID:', projectId);
        console.log('Reply Author Name:', user.fullName);
        console.log('Project Name:', project.name);
        
        await notifyUser(
            commentAuthorId,
            userId,
            projectId,
            'reply',
            `${user.fullName} replied to your comment on "${project.name}"`
        );
        
        console.log('Reply notification sent successfully');
        
        return res.status(201).json({
            success: true,
            reply: addedReply
        });
        
    } catch (error) {
        console.error('Error adding reply:', error);
        return res.status(500).json({ error: 'Failed to add reply' });
    }
}




// ========================================
// UPDATE PROJECT (Description, Links only)
// ========================================
exports.updateProject = async (req, res) => {
    try {
        const projectId = req.params.id;
        const userId = req.session?.userId;
        const { description, githubLink, websiteLink } = req.body;
        
        if (!userId) {
            return res.status(401).json({ error: 'User not logged in' });
        }
        
        // Find the project
        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }
        
        // Check if user is the uploader
        if (project.userId.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'You are not authorized to edit this project' });
        }
        
        // Update only allowed fields
        const updateData = {};
        if (description !== undefined) updateData.description = description.trim();
        if (githubLink !== undefined) updateData.githubLink = githubLink.trim();
        if (websiteLink !== undefined) updateData.websiteLink = websiteLink.trim();
        
        // Update project
        const updatedProject = await Project.findByIdAndUpdate(
            projectId,
            updateData,
            { new: true }
        );
        
        return res.status(200).json({ 
            success: true,
            message: 'Project updated successfully',
            project: updatedProject
        });
        
    } catch (error) {
        console.error('Error updating project:', error);
        return res.status(500).json({ error: 'Failed to update project' });
    }
}


// ========================================
// DELETE PROJECT
// ========================================
exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.session?.userId;

    if (!userId) return res.status(401).json({ error: 'User not logged in' });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    if (project.userId.toString() !== userId.toString())
      return res.status(403).json({ error: 'You are not authorized to delete this project' });

    // Delete images from Cloudinary
    if (project.thumbnailUrl?.public_id) {
      await cloudinary.uploader.destroy(project.thumbnailUrl.public_id);
    }

    if (project.otherImages && project.otherImages.length > 0) {
      for (const img of project.otherImages) {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      }
    }

    // Delete associated data
    await Comment.deleteMany({ projectId });
    await Like.deleteMany({ projectId });
    await View.deleteMany({ projectId });

    // Delete the project
    await Project.findByIdAndDelete(projectId);

    return res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
};

module.exports = {
    getProject: exports.getProject,
    recordView: exports.recordView,
    toggleLike: exports.toggleLike,
    addComment: exports.addComment,
    deleteComment: exports.deleteComment,
    deleteReply: exports.deleteReply,
    addReply: exports.addReply,
    updateProject: exports.updateProject,
    deleteProject: exports.deleteProject
};

