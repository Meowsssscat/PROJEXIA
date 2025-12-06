const Project = require('../models/uploadProject');
const cloudinary = require('../config/cloudinaryConfig');

const fs = require('fs');

exports.getUploadPage = (req, res) => {
  return res.render('upload-modern');
};

exports.listProjects = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }
    const projects = await Project.find({ userId }).sort({ createdAt: -1 }).lean();
    return res.json(projects);
  } catch (err) {
    console.error('listProjects error', err);
    return res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

exports.createProject = async (req, res) => {
  try {
    const userId = req.body.userId;
    const name = req.body.name || req.body.projectName;
    const description = req.body.description || '';
    const rawDevelopers = req.body['developers[]'] || req.body.developers;
    const rawTechnologies = req.body['technologies[]'] || req.body.technologies;
    const developers = (Array.isArray(rawDevelopers) ? rawDevelopers : (typeof rawDevelopers === 'string' ? rawDevelopers.split(',') : []))
      .map(s => String(s).trim()).filter(Boolean);
    const technologies = (Array.isArray(rawTechnologies) ? rawTechnologies : (typeof rawTechnologies === 'string' ? rawTechnologies.split(',') : []))
      .map(s => String(s).trim()).filter(Boolean);
    const githubLink = req.body.githubLink || req.body.sourceCode || '';
    const websiteLink = req.body.websiteLink || req.body.liveDemo || '';

    if (!userId || !name || developers.length === 0 || technologies.length === 0) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get program and yearLevel from user's profile
    const User = require('../models/User');
    const user = await User.findById(userId).select('program year');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const program = user.program || '';
    const yearLevel = user.year || '';

    // Check project limit (max 5 projects per user)
    const projectCount = await Project.countDocuments({ userId });
    if (projectCount >= 5) {
      return res.status(400).json({ 
        message: 'Project limit reached. You can only upload up to 5 projects.' 
      });
    }

    const files = req.files || {};
    const thumb = files.thumbnail && files.thumbnail[0];
    const imgs = files.images || [];

    // Debug logging
    console.log('Files received:', {
      hasFiles: !!req.files,
      fileKeys: Object.keys(req.files || {}),
      thumbnailCount: files.thumbnail ? files.thumbnail.length : 0,
      imagesCount: imgs.length
    });

    // Validate image limits
    if (!thumb) {
      console.error('Thumbnail validation failed. Files:', req.files);
      return res.status(400).json({ message: 'Thumbnail is required' });
    }

    // Images are now optional (can upload with just thumbnail)
    if (imgs.length > 5) {
      return res.status(400).json({ 
        message: 'You can only upload up to 5 project images' 
      });
    }

    // ✅ Upload thumbnail to Cloudinary
    let thumbnail = null;
    if (thumb) {
      try {
        // Don't specify timestamp - let Cloudinary handle it
        const result = await cloudinary.uploader.upload(thumb.path, {
          folder: `projects/${userId}/${name}/thumbnail`,
          resource_type: 'auto'
        });
        thumbnail = {
          url: result.secure_url,
          public_id: result.public_id
        };
        fs.unlinkSync(thumb.path);
      } catch (uploadError) {
        console.error('Thumbnail upload error:', uploadError);
        // Clean up file
        if (fs.existsSync(thumb.path)) {
          fs.unlinkSync(thumb.path);
        }
        throw new Error('Failed to upload thumbnail image. Your system time may be incorrect. Please sync your computer clock and try again.');
      }
    }

    // ✅ Upload other images to Cloudinary (max 5)
    const otherImages = [];
    const imagesToUpload = imgs.slice(0, 5); // Ensure max 5 images
    for (const file of imagesToUpload) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: `projects/${userId}/${name}/images`,
          resource_type: 'auto'
        });
        otherImages.push({
          url: result.secure_url,
          public_id: result.public_id
        });
        fs.unlinkSync(file.path);
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        // Clean up file and continue with other images
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        // Continue with other images even if one fails
      }
    }

    // ✅ Save project to DB
    const doc = await Project.create({
      userId,
      name,
      description,
      developers,
      technologies,
      program,
      yearLevel,
      thumbnailUrl: thumbnail,
      otherImages,
      githubLink,
      websiteLink
    });

    return res.status(201).json({ message: 'Project uploaded successfully', project: doc });
  } catch (err) {
    console.error('createProject error', err);
    return res.status(500).json({ message: 'Failed to upload project' });
  }
};
