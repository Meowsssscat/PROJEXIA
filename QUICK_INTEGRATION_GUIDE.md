# Quick Integration Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Copy Files
All necessary files have been created in:
- **CSS Files**: `/public/css/`
  - `projexia-design-system.css`
  - `navbar-modern.css`
  - `hero.css`
  - `features-grid.css`
  - `how-it-works.css`
  - `cta-banner.css`
  - `footer-modern.css`
  - `browse-projects.css`
  - `project-detail.css`

- **EJS Templates**: `/public/views/`
  - `landing-modern.ejs`
  - `browse-modern.ejs`
  - `project-detail-modern.ejs`
  - `partials/navbar-modern.ejs`
  - `partials/hero-modern.ejs`
  - `partials/features-grid-modern.ejs`
  - `partials/how-it-works-modern.ejs`
  - `partials/cta-banner-modern.ejs`
  - `partials/footer-modern.ejs`

### Step 2: Update Your Routes

Replace your existing routes in `routes/home.js`:

```javascript
const express = require('express');
const router = express.Router();
const Project = require('../models/uploadProject');

// Landing page
router.get('/', (req, res) => {
  res.render('landing-modern', { user: req.user });
});

// Browse projects page
router.get('/browse', async (req, res) => {
  try {
    const projects = await Project.find().populate('author');
    res.render('browse-modern', { 
      projects, 
      user: req.user 
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).render('error', { error: error.message });
  }
});

// Project detail page
router.get('/project/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('author')
      .populate('comments.author');
    
    if (!project) {
      return res.status(404).render('error', { error: 'Project not found' });
    }

    res.render('project-detail-modern', { 
      project, 
      user: req.user 
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).render('error', { error: error.message });
  }
});

module.exports = router;
```

### Step 3: Update Server.js

Ensure your Express app is configured correctly:

```javascript
const express = require('express');
const path = require('path');
const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make user available in all views
app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// Routes
const homeRoutes = require('./routes/home');
app.use('/', homeRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

### Step 4: Add Google Fonts

All templates reference Google Fonts. The font imports are included in the templates, so make sure you have internet access or add to your HTML head:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet" />
```

### Step 5: Create User Context

For the navbar to show user information, you need to pass the user object:

```javascript
// In your auth middleware or after login
req.user = {
  _id: user._id,
  name: user.fullName,
  email: user.email,
  program: user.program,
  profilePicture: user.profilePicture
};

res.locals.user = req.user;
```

---

## 📱 Pages Overview

### 1. **Landing Page** (`/`)
- File: `landing-modern.ejs`
- Shows: Hero, Features, How it works, CTA, Footer
- Data needed: None (static content)

### 2. **Browse Projects** (`/browse`)
- File: `browse-modern.ejs`
- Shows: Project grid with filters and search
- Data needed: `projects` array with objects containing:
  - `_id`, `title`, `description`, `thumbnail`
  - `program`, `yearLevel`, `author`, `likes`, `comments`

### 3. **Project Detail** (`/project/:id`)
- File: `project-detail-modern.ejs`
- Shows: Full project information
- Data needed: `project` object with:
  - All fields from browse + full description
  - `technologies[]`, `features[]`, `comments[]`, `sourceCode`

---

## 🎨 Customization Examples

### Change Primary Color to Blue
Edit `/public/css/projexia-design-system.css`:
```css
:root {
  --primary: 210 45% 50%;  /* Changed from maroon */
  --primary-foreground: 0 0% 98%;
  --primary-glow: 210 50% 60%;
}
```

### Modify Logo Name
Edit navbar template:
```ejs
<h1>
  <span class="brand-span-primary">Your</span>
  <span class="brand-span-secondary">Brand</span>
  <span class="brand-span-primary">Here</span>
</h1>
```

### Add Navigation Links
Edit navbar partial `navbar-modern.ejs`:
```ejs
<a href="/about" class="navbar-nav-link story-link">About</a>
<a href="/contact" class="navbar-nav-link story-link">Contact</a>
```

### Change Hero Title
Edit hero partial:
```ejs
<h1 class="hero-title">
  <span class="title-span-primary">Your</span>
  <span class="title-span-secondary">Title</span>
  <span class="title-span-primary">Here</span>
</h1>
```

---

## 🔌 API Endpoints You'll Need

For the interactive features to work, add these endpoints to your backend:

### Like Project
```javascript
POST /api/projects/:id/like
Body: { }
Response: { success: true, likes: 42 }
```

### Post Comment
```javascript
POST /api/projects/:id/comments
Body: { text: "Great project!" }
Response: { success: true, comment: {...} }
```

### Search/Filter Projects
```javascript
GET /api/projects?search=keyword&program=BSCS&year=2&language=javascript
Response: { items: [...], total: 10 }
```

---

## ✅ Testing Checklist

- [ ] Landing page loads and displays all sections
- [ ] Navbar toggles on mobile devices
- [ ] Browse page shows project list
- [ ] Filters work correctly
- [ ] Search functionality works
- [ ] Project detail page displays correctly
- [ ] Like button works
- [ ] Comment form works
- [ ] Footer displays on all pages
- [ ] Responsive design works (test on mobile)
- [ ] All links navigate correctly
- [ ] User data displays (name, avatar)

---

## 🐛 Troubleshooting

### CSS Not Loading
- Check that static files are served: `app.use(express.static('public'))`
- Verify file paths in HTML are correct
- Clear browser cache (Ctrl+Shift+Delete)

### User Not Showing in Navbar
- Ensure `res.locals.user` is set in middleware
- Check that user data is being passed to `res.render()`

### Fonts Not Loading
- Ensure internet connection for Google Fonts CDN
- Or download fonts locally and update paths

### Page Not Rendering
- Check view engine is set: `app.set('view engine', 'ejs')`
- Verify view folder path: `app.set('views', path.join(__dirname, 'public/views'))`
- Check for errors in server logs

---

## 📞 Support

For detailed documentation, see `UI_MIGRATION_COMPLETE.md` in the project root.

Good luck! 🚀
