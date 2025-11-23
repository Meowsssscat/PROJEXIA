const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Serve static files
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));

// Uploads folder
const uploadsPath = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsPath, { recursive: true });
app.use('/uploads', express.static(uploadsPath));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/', homeRoutes);
app.use('/', profileRoutes);
app.use('/', uploadProjectRoutes);
app.use('/', projects);
app.use('/editProfile', editProfileRoute);
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

// Root route
const landingController = require('./controllers/landingController');
app.get('/', landingController.getLandingPage);

// Auth pages
app.get('/signin', (req, res) => res.render('signin'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/confirmation', (req, res) => res.render('confirmation'));
app.get('/forgot-password', (req, res) => res.render('forgotPassword'));

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
