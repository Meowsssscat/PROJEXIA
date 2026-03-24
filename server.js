const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
require('dotenv').config();

// Import database configuration
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const homeRoutes = require('./routes/home');
const profileRoutes = require('./routes/profile');
const uploadProjectRoutes = require('./routes/uploadProject');
const projects = require('./routes/project');
const editProfileRoute = require('./routes/editProfile');

const otherProfileRoutes = require('./routes/otherProfile');

const app = express();

// Create HTTP server for Socket.io
const http = require("http");
const server = http.createServer(app);

// Setup Socket.io
const { Server } = require("socket.io");
const io = new Server(server);

// Make io global so controllers can emit events
global._io = io;

// SOCKET.IO: When client connects
io.on("connection", (socket) => {

  // Client joins a private room equal to their userId
  socket.on("joinRoom", (userId) => {
    socket.join(userId);
  });

  console.log("A user connected");
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// SESSION MIDDLEWARE (must come before routes)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to false for Railway - Railway handles HTTPS at proxy level
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
    sameSite: 'lax' // Important for Railway deployment
  },
  proxy: process.env.NODE_ENV === 'production' // Trust Railway's proxy
}));







// Optional user middleware - Attach user to req if logged in (doesn't require authentication)
app.use(async (req, res, next) => {
  try {
    const userId = req.session?.userId;
    if (userId) {
      const User = require('./models/User');
      const currentUser = await User.findById(userId).select('-password');
      req.user = currentUser || null;
      res.locals.user = currentUser || null; // Make user available in all views
    } else {
      req.user = null;
      res.locals.user = null;
    }
  } catch (err) {
    console.error('Error in optional user middleware:', err);
    req.user = null;
    res.locals.user = null;
  }
  next();
});

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

// Uploads folder
const uploadsPath = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views'));

// Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/', homeRoutes);
const pageRoutes = require('./routes/pageRoutes');
app.use('/', pageRoutes);
app.use('/', profileRoutes);
app.use('/api/editProfile', editProfileRoute);
app.use('/', uploadProjectRoutes);
app.use('/', projects);
const notificationRoutes = require('./routes/notificationRoutes');
app.use('/notifications', notificationRoutes);
app.use('/visit/profile', otherProfileRoutes);
const settingsRoutes = require('./routes/settings');
app.use('/settings', settingsRoutes);
const forgotPasswordRoutes = require('./routes/forgotPassword');
app.use('/forgot-password', forgotPasswordRoutes);
const footerRoutes = require('./routes/footer');
app.use('/api/footer', footerRoutes);
const aboutRoutes = require('./routes/about');
app.use('/about', aboutRoutes);
const likedProjectsRoutes = require('./routes/likedProjects');
app.use('/', likedProjectsRoutes);
const recommendationRoutes = require('./routes/recommendations');
app.use('/api/recommendations', recommendationRoutes);

// AI Tools API (for external AI function calling)
const aiToolsRoutes = require('./routes/aiTools');
app.use('/api/ai-tools', aiToolsRoutes);

// API: Get current user ID (for notifications)
app.get('/api/user-id', (req, res) => {
  if (req.session?.userId) {
    res.json({ userId: req.session.userId });
  } else {
    res.json({ userId: null });
  }
});

// Root route
const landingController = require('./controllers/landingController');
const optionalAuth = require('./middleware/optionalAuth');
app.get('/', optionalAuth, landingController.getLandingPage);

// Auth pages - redirect to modern auth page
app.get('/signin', (req, res) => res.redirect('/auth?type=signin'));
app.get('/signup', (req, res) => res.redirect('/auth?type=signup'));
app.get('/confirmation', (req, res) => res.render('confirmation'));
app.get('/forgot-password', (req, res) => res.render('forgotPassword'));

// Test chat page
app.get('/test-chat', (req, res) => res.render('test-chat'));

// Logout route - clears session and redirects to landing page
app.get('/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.redirect('/');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// Debug endpoint (TEMPORARY - remove after fixing)
app.get('/debug-env', (req, res) => {
  res.json({
    EMAIL_USER: process.env.EMAIL_USER || 'NOT SET',
    EMAIL_PASS_EXISTS: !!process.env.EMAIL_PASS,
    EMAIL_PASS_LENGTH: process.env.EMAIL_PASS?.length || 0,
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI_EXISTS: !!process.env.MONGODB_URI
  });
});


// Chat endpoint
app.post('/api/v1/chat', async (req, res) => {
  const { message, userId, context } = req.body;

  try {
    const Project = require('./models/uploadProject');
    const User = require('./models/User');
    const Like = require('./models/likes');
    const View = require('./models/views');

    let contextBlocks = [];

    const msg = (message || '').toLowerCase();

    // --- Project search by technology ---
    if (msg.includes('react') || msg.includes('node') || msg.includes('vue') ||
        msg.includes('python') || msg.includes('project') || msg.includes('use') ||
        msg.includes('built with') || msg.includes('technology') || msg.includes('tech')) {

      // Extract tech keywords from message
      const techKeywords = ['react', 'node', 'vue', 'angular', 'python', 'java',
        'php', 'laravel', 'django', 'flutter', 'kotlin', 'swift', 'mongodb',
        'mysql', 'postgresql', 'express', 'next', 'typescript', 'javascript'];
      const foundTechs = techKeywords.filter(t => msg.includes(t));

      const query = foundTechs.length > 0
        ? { technologies: { $in: foundTechs.map(t => new RegExp(t, 'i')) } }
        : {};

      const projects = await Project.find(query).select('name description technologies').limit(15).lean();

      if (projects.length > 0) {
        contextBlocks.push(
          'Projects in the platform:\n' +
          projects.map(p => `- "${p.name}": ${p.description || 'No description'}. Tech: ${(p.technologies || []).join(', ')}`).join('\n')
        );
      }
    }

    // --- Similar projects (if context.projectId passed) ---
    if (context?.projectId && (msg.includes('similar') || msg.includes('like this') || msg.includes('recommend'))) {
      const current = await Project.findById(context.projectId).select('name technologies').lean();
      if (current) {
        const similar = await Project.find({
          _id: { $ne: current._id },
          technologies: { $in: current.technologies }
        }).select('name description technologies').limit(8).lean();

        contextBlocks.push(
          `Current project: "${current.name}" uses ${current.technologies.join(', ')}.\n` +
          'Similar projects:\n' +
          similar.map(p => `- "${p.name}": ${p.description || 'No description'}. Tech: ${(p.technologies || []).join(', ')}`).join('\n')
        );
      }
    }

    // --- Explain current project ---
    if (context?.projectId && (msg.includes('explain') || msg.includes('what does') || msg.includes('about this'))) {
      const proj = await Project.findById(context.projectId).select('name description technologies').lean();
      if (proj) {
        contextBlocks.push(
          `Project to explain:\nName: ${proj.name}\nDescription: ${proj.description || 'No description provided'}\nTechnologies: ${(proj.technologies || []).join(', ')}`
        );
      }
    }

    // --- Top contributors ---
    if (msg.includes('contributor') || msg.includes('top user') || msg.includes('most liked') || msg.includes('popular user')) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const topLiked = await Like.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $lookup: { from: 'allprojects', localField: 'projectId', foreignField: '_id', as: 'project' } },
        { $unwind: '$project' },
        { $group: { _id: '$project.userId', likeCount: { $sum: 1 } } },
        { $sort: { likeCount: -1 } },
        { $limit: 5 }
      ]);

      const userIds = topLiked.map(t => t._id);
      const users = await User.find({ _id: { $in: userIds } }).select('fullName program year').lean();
      const userMap = {};
      users.forEach(u => { userMap[u._id.toString()] = u; });

      if (topLiked.length > 0) {
        contextBlocks.push(
          'Top contributors this month (by likes received):\n' +
          topLiked.map((t, i) => {
            const u = userMap[t._id.toString()];
            return `${i + 1}. ${u?.fullName || 'Unknown'} (${u?.program || ''} ${u?.year || ''}) - ${t.likeCount} likes`;
          }).join('\n')
        );
      }
    }

    // Build final prompt
    const systemContext = contextBlocks.length > 0
      ? `You are a helpful assistant for Projexia, a project showcase platform for CCS students. Use the following data to answer the user's question accurately.\n\n${contextBlocks.join('\n\n')}\n\n`
      : `You are a helpful assistant for Projexia, a project showcase platform for CCS students. `;

    const fullPrompt = systemContext + `User asks: ${message}`;

    const response = await axios.post(
      process.env.AI_PLATFORM_URL + '/api/v1/chat',
      { prompt: fullPrompt },
      {
        headers: {
          'X-API-Key': process.env.AI_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`User ${userId} asked: ${message}`);

    res.json({
      reply: response.data.message,
      model: response.data.model
    });
  } catch (error) {
    console.error('AI Platform Error:', error.message, error.response?.data);
    res.status(500).json({ error: 'Sorry, our support assistant is temporarily unavailable.', detail: error.message });
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start Server — ONLY ONE LISTEN()
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
