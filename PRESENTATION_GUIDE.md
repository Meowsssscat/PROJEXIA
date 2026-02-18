# PROJEXIA - System Presentation Guide

## 📋 Table of Contents
1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Key Features](#key-features)
4. [System Architecture](#system-architecture)
5. [User Flow](#user-flow)
6. [Database Schema](#database-schema)
7. [Security Features](#security-features)
8. [API Endpoints](#api-endpoints)
9. [Real-time Features](#real-time-features)
10. [Deployment](#deployment)

---

## 🎯 System Overview

**PROJEXIA** is a modern web-based project showcase platform designed specifically for students to share, discover, and collaborate on academic projects. It serves as a digital portfolio and community hub for student developers.

### Purpose
- **Showcase** student projects and achievements
- **Connect** students with similar interests
- **Inspire** through shared work and ideas
- **Learn** from peer projects and implementations

### Target Users
- College students (BSIT, BSCS, BSIS)
- Academic institutions
- Tech communities
- Potential employers/recruiters

---

## 💻 Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Frontend
- **EJS** - Templating engine
- **Vanilla JavaScript** - Client-side interactivity
- **CSS3** - Modern styling with CSS variables
- **Responsive Design** - Mobile-first approach

### Third-Party Services
- **Cloudinary** - Image/file storage and optimization
- **Nodemailer** - Email service (OTP, notifications)
- **Socket.IO** - Real-time notifications
- **Bcrypt** - Password hashing
- **JWT** - Session management

### Development Tools
- **Git/GitHub** - Version control
- **Railway/Vercel** - Deployment platforms
- **VS Code** - Development environment

---

## ✨ Key Features

### 1. **User Authentication & Authorization**
- **Sign Up/Sign In** with email verification
- **OTP-based email verification** (6-digit code, 10-minute expiry)
- **Password reset** via email
- **Session management** with JWT tokens
- **Secure password hashing** with bcrypt

**How it works:**
1. User registers with email, password, and academic info
2. System sends OTP to email
3. User verifies OTP within 10 minutes
4. Account is activated and user can log in
5. JWT token is stored in cookies for session management

### 2. **Project Management**

#### Upload Project
- **Title & Description** - Project details
- **Thumbnail Image** - Visual preview (Cloudinary)
- **Project Images** - Multiple images (up to 5)
- **Technologies Used** - Tag-based selection
- **Category** - Web, Mobile, Desktop, AI/ML, etc.
- **GitHub Link** - Source code repository
- **Live Demo Link** - Deployed project URL

**How it works:**
1. User fills out project form
2. Images are uploaded to Cloudinary
3. Project data is saved to MongoDB
4. Thumbnail is optimized for fast loading
5. Project appears in user's profile and browse page

#### Edit/Delete Project
- **Edit** - Update project details and images
- **Delete** - Remove project (with Cloudinary cleanup)
- **Validation** - Only project owner can edit/delete

### 3. **Browse & Discovery**

#### Browse Projects
- **Grid Layout** - Responsive project cards
- **Search** - By title, description, or technologies
- **Filter** - By category, year level, program
- **Sort** - By newest, most liked, most viewed
- **Pagination** - Efficient loading

**How it works:**
1. Projects are fetched from database with filters
2. Results are paginated (12 per page)
3. Each card shows thumbnail, title, author, stats
4. Click to view full project details

#### Project Details
- **Full Information** - Complete project description
- **Image Gallery** - Swipeable image carousel
- **Author Profile** - Link to creator's profile
- **Statistics** - Views, likes, comments
- **Actions** - Like, comment, share
- **Related Projects** - Similar projects

### 4. **Social Features**

#### Like System
- **Like/Unlike** projects
- **Like Counter** - Real-time updates
- **Liked Projects** - View all liked projects in profile
- **Navbar Badge** - Quick access to liked projects

**How it works:**
1. User clicks heart icon on project
2. Like is saved to database
3. Counter updates in real-time
4. Project is added to user's liked collection
5. Notification sent to project owner

#### Comment System
- **Add Comments** - Share thoughts and feedback
- **Delete Comments** - Remove own comments
- **Comment Counter** - Total comments displayed
- **Real-time Updates** - New comments appear instantly

**How it works:**
1. User types comment and submits
2. Comment is saved with user info and timestamp
3. Notification sent to project owner
4. Comment appears in project detail page
5. "Time ago" format (e.g., "2 hours ago")

#### Notification System
- **Real-time Notifications** - Socket.IO powered
- **Types:**
  - New like on your project
  - New comment on your project
  - Project approval/rejection
- **Notification Panel** - Dropdown in navbar
- **Unread Badge** - Count of unread notifications
- **Mark as Read** - Click to mark as read
- **Delete Notifications** - Remove individual notifications
- **Clear All** - Remove all notifications

**How it works:**
1. Action triggers notification (like, comment)
2. Notification saved to database
3. Socket.IO emits event to user
4. Notification appears in real-time
5. Badge updates with unread count

### 5. **User Profile**

#### Profile Display
- **Profile Picture** - Circular avatar (Cloudinary)
- **User Information:**
  - Full Name
  - Program (BSIT, BSCS, BSIS)
  - Year Level (1st-4th)
  - Track/Specialization (WMAD, AMG, etc.)
  - Bio (160 characters max)
- **Social Links** - GitHub, Portfolio, LinkedIn
- **Statistics:**
  - Total Projects
  - Total Likes Received
  - Liked Projects Count
- **Project Tabs:**
  - My Projects - Projects uploaded by user
  - Liked Projects - Projects user has liked

**Layout:**
- **3-Column Design** (Desktop):
  1. Profile Picture
  2. User Info + Stats + Social Links
  3. Action Buttons (Edit Profile, Upload Project)
- **Stacked Layout** (Mobile)

#### Edit Profile
- **Update Information:**
  - Full Name
  - Bio
  - Program & Year Level
  - Track/Specialization
- **Profile Picture:**
  - Upload new image
  - Delete current image
  - Circular display
- **Social Links:**
  - GitHub URL
  - Portfolio URL
  - LinkedIn URL

**How it works:**
1. User clicks "Edit Profile"
2. Form is pre-filled with current data
3. User updates fields and/or uploads new image
4. Image is uploaded to Cloudinary
5. Old image is deleted from Cloudinary (if replaced)
6. Profile data is updated in database
7. User is redirected to profile page

### 6. **Settings & Security**

#### Account Settings
- **Change Password** - Update password securely
- **Email** - Display only (contact support to change)
- **Account Status** - Active/Inactive

#### Password Change Process
1. User enters current password
2. System verifies current password
3. User enters new password (min 8 characters)
4. Password is hashed with bcrypt
5. New hash is saved to database
6. User is logged out and must log in again

### 7. **Admin Features** (If applicable)

#### Project Moderation
- **Approve/Reject** projects
- **View all projects** - Pending, approved, rejected
- **User management** - View all users

---

## 🏗️ System Architecture

### MVC Pattern (Model-View-Controller)

```
PROJEXIA/
├── models/              # Database schemas
│   ├── User.js         # User model
│   ├── uploadProject.js # Project model
│   ├── comments.js     # Comment model
│   ├── likes.js        # Like model
│   ├── Notification.js # Notification model
│   ├── OTP.js          # OTP model
│   └── views.js        # View tracking
│
├── controllers/         # Business logic
│   ├── authController.js
│   ├── projectController.js
│   ├── profileController.js
│   ├── commentController.js
│   ├── likeController.js
│   └── notificationController.js
│
├── routes/             # API routes
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   ├── profileRoutes.js
│   └── apiRoutes.js
│
├── views/              # EJS templates
│   ├── home-modern.ejs
│   ├── browse-modern.ejs
│   ├── profile-modern.ejs
│   ├── project-detail-modern.ejs
│   └── partials/       # Reusable components
│
├── public/             # Static files
│   ├── css/           # Stylesheets
│   ├── js/            # Client-side scripts
│   └── images/        # Static images
│
├── middleware/         # Custom middleware
│   ├── authMiddleware.js
│   └── validation.js
│
├── config/            # Configuration
│   ├── database.js
│   └── cloudinaryConfig.js
│
├── services/          # External services
│   └── emailService.js
│
└── server.js          # Entry point
```

### Request Flow

```
Client Request
    ↓
Express Router
    ↓
Middleware (Auth, Validation)
    ↓
Controller (Business Logic)
    ↓
Model (Database Operations)
    ↓
Response to Client
```

---

## 👤 User Flow

### 1. **New User Registration**
```
Landing Page → Sign Up → Enter Details → Verify Email (OTP) → Login → Home
```

### 2. **Existing User Login**
```
Landing Page → Sign In → Enter Credentials → Home
```

### 3. **Upload Project**
```
Home → Upload Project → Fill Form → Upload Images → Submit → Profile (My Projects)
```

### 4. **Browse & Interact**
```
Home → Browse Projects → View Project → Like/Comment → Notifications
```

### 5. **Profile Management**
```
Profile → Edit Profile → Update Info → Save → Profile (Updated)
```

---

## 🗄️ Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  fullName: String,
  email: String (unique, indexed),
  password: String (hashed),
  program: String (BSIT, BSCS, BSIS),
  year: String (1st, 2nd, 3rd, 4th),
  track: String (WMAD, AMG, SMP, etc.),
  bio: String (max 160 chars),
  profilePicture: {
    url: String,
    publicId: String
  },
  github: String,
  portfolio: String,
  linkedin: String,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  userId: ObjectId (ref: User),
  thumbnailUrl: {
    url: String,
    publicId: String
  },
  images: [{
    url: String,
    publicId: String
  }],
  technologies: [String],
  category: String,
  githubLink: String,
  liveDemoLink: String,
  likes: Number (default: 0),
  comments: Number (default: 0),
  viewCount: Number (default: 0),
  status: String (pending, approved, rejected),
  createdAt: Date,
  updatedAt: Date
}
```

### Comment Collection
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: Project),
  userId: ObjectId (ref: User),
  content: String,
  createdAt: Date
}
```

### Like Collection
```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: Project),
  userId: ObjectId (ref: User),
  createdAt: Date
}
```

### Notification Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: String (like, comment, approval),
  message: String,
  projectId: ObjectId (ref: Project),
  fromUserId: ObjectId (ref: User),
  isRead: Boolean (default: false),
  createdAt: Date
}
```

### OTP Collection
```javascript
{
  _id: ObjectId,
  email: String,
  otp: String (6 digits),
  expiresAt: Date (10 minutes from creation),
  createdAt: Date
}
```

---

## 🔒 Security Features

### 1. **Password Security**
- **Bcrypt Hashing** - Passwords are never stored in plain text
- **Salt Rounds** - 10 rounds for strong hashing
- **Password Requirements** - Minimum 8 characters

### 2. **Authentication**
- **JWT Tokens** - Secure session management
- **HTTP-Only Cookies** - Prevent XSS attacks
- **Token Expiration** - 7-day expiry
- **Email Verification** - OTP-based verification

### 3. **Authorization**
- **Middleware Protection** - Routes require authentication
- **Ownership Validation** - Users can only edit/delete own content
- **Role-Based Access** - Admin vs regular user permissions

### 4. **Input Validation**
- **Server-Side Validation** - All inputs validated
- **Sanitization** - Prevent SQL injection and XSS
- **File Upload Limits** - Max file size and type restrictions

### 5. **Data Protection**
- **Environment Variables** - Sensitive data in .env
- **CORS Configuration** - Controlled cross-origin requests
- **Rate Limiting** - Prevent brute force attacks (if implemented)

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/signup              - Register new user
POST   /api/verify-otp          - Verify email OTP
POST   /api/signin              - User login
POST   /api/logout              - User logout
POST   /api/forgot-password     - Request password reset
POST   /api/reset-password      - Reset password with token
```

### Projects
```
GET    /api/projects            - Get all projects (with filters)
GET    /api/projects/:id        - Get single project
POST   /api/upload              - Upload new project
PUT    /api/projects/:id        - Update project
DELETE /api/projects/:id        - Delete project
GET    /api/projects/user/:id   - Get user's projects
```

### Profile
```
GET    /api/profile             - Get current user profile
GET    /api/profile/:id         - Get user profile by ID
POST   /api/editProfile         - Update profile
POST   /api/change-password     - Change password
```

### Social Features
```
POST   /api/like/:projectId     - Like/unlike project
POST   /api/comment/:projectId  - Add comment
DELETE /api/comment/:id         - Delete comment
GET    /api/liked-projects      - Get liked projects
```

### Notifications
```
GET    /api/notifications       - Get user notifications
PUT    /api/notifications/:id   - Mark as read
DELETE /api/notifications/:id   - Delete notification
DELETE /api/notifications       - Clear all notifications
```

### Statistics
```
GET    /api/footer/statistics   - Get platform statistics
GET    /api/footer/average-rating - Get average rating
```

---

## ⚡ Real-time Features

### Socket.IO Implementation

**Server-Side (server.js)**
```javascript
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Join user's personal room
  socket.on('join', (userId) => {
    socket.join(userId);
  });
  
  // Emit notification to specific user
  socket.to(userId).emit('notification', notificationData);
});
```

**Client-Side (notifications.js)**
```javascript
const socket = io();

// Join personal room
socket.emit('join', currentUserId);

// Listen for notifications
socket.on('notification', (data) => {
  updateNotificationBadge();
  showToast(data.message);
});
```

### Real-time Events
1. **New Like** - Instant notification to project owner
2. **New Comment** - Real-time comment display
3. **Project Approval** - Immediate status update
4. **Badge Updates** - Live notification count

---

## 🚀 Deployment

### Environment Variables (.env)
```
# Database
MONGODB_URI=mongodb+srv://...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email Service
EMAIL_USER=...
EMAIL_PASS=...

# JWT
JWT_SECRET=...

# Server
PORT=3000
NODE_ENV=production
```

### Deployment Platforms

#### Railway
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically on push
4. Custom domain support

#### Vercel
1. Import GitHub project
2. Configure build settings
3. Add environment variables
4. Deploy with serverless functions

### Database Hosting
- **MongoDB Atlas** - Cloud-hosted MongoDB
- **Free Tier** - 512MB storage
- **Automatic Backups**
- **Global Distribution**

### File Storage
- **Cloudinary** - Image hosting and optimization
- **Free Tier** - 25GB storage, 25GB bandwidth
- **Automatic Optimization** - Responsive images
- **CDN Delivery** - Fast global access

---

## 📊 System Statistics

### Performance Metrics
- **Page Load Time** - < 2 seconds
- **Image Optimization** - Cloudinary auto-optimization
- **Responsive Design** - Mobile-first approach
- **Browser Support** - Modern browsers (Chrome, Firefox, Safari, Edge)

### Scalability
- **Database Indexing** - Fast queries on email, userId
- **Pagination** - Efficient data loading
- **Lazy Loading** - Images load on demand
- **Caching** - Static assets cached

---

## 🎨 Design System

### Color Scheme
- **Primary** - Blue gradient (#3b82f6 → #8b5cf6)
- **Secondary** - Purple (#8b5cf6)
- **Background** - White (light) / Dark gray (dark)
- **Text** - Dark gray (light) / White (dark)

### Typography
- **Headings** - Orbitron (tech-inspired)
- **Body** - Inter (clean, readable)
- **Monospace** - For code snippets

### Components
- **Buttons** - Gradient, hover effects
- **Cards** - Elevated, rounded corners
- **Forms** - Clean, validated inputs
- **Modals** - Centered, backdrop blur
- **Toasts** - Non-intrusive notifications

### Responsive Breakpoints
- **Mobile** - < 768px
- **Tablet** - 768px - 1024px
- **Desktop** - > 1024px

---

## 🎯 Presentation Tips

### Demo Flow
1. **Landing Page** - Show hero section and features
2. **Sign Up** - Demonstrate OTP verification
3. **Browse Projects** - Show search and filters
4. **Project Details** - Like, comment, view stats
5. **Upload Project** - Create new project
6. **Profile** - Show user profile and projects
7. **Notifications** - Real-time notification demo
8. **Edit Profile** - Update user information
9. **Mobile View** - Show responsive design

### Key Points to Highlight
- ✅ Modern, clean UI/UX
- ✅ Real-time notifications
- ✅ Secure authentication
- ✅ Image optimization
- ✅ Responsive design
- ✅ Social features (like, comment)
- ✅ Search and filter capabilities
- ✅ User profiles and portfolios

### Technical Highlights
- 🔧 MVC architecture
- 🔧 RESTful API design
- 🔧 Socket.IO for real-time features
- 🔧 Cloudinary for media management
- 🔧 MongoDB for flexible data storage
- 🔧 JWT for secure authentication

---

## 📝 Conclusion

PROJEXIA is a comprehensive project showcase platform that combines modern web technologies with user-friendly design. It provides students with a professional space to display their work, connect with peers, and build their digital portfolios.

### Future Enhancements
- 🔮 Project ratings and reviews
- 🔮 Advanced search with AI
- 🔮 Project collaboration features
- 🔮 Export portfolio as PDF
- 🔮 Integration with GitHub API
- 🔮 Project analytics dashboard
- 🔮 Mobile app (React Native)

---

**Good luck with your presentation! 🎉**
