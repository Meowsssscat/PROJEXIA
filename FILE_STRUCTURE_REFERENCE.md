# UI Migration - File Structure Reference

## 📂 Complete File Structure

```
PROJEXIA/
├── public/
│   ├── css/
│   │   ├── projexia-design-system.css          ⭐ MAIN - Design tokens & utilities
│   │   ├── navbar-modern.css                   Navigation component
│   │   ├── hero.css                            Hero section
│   │   ├── features-grid.css                   6-feature showcase
│   │   ├── how-it-works.css                    4-step process
│   │   ├── cta-banner.css                      Call-to-action banner
│   │   ├── footer-modern.css                   Footer component
│   │   ├── browse-projects.css                 Project browsing page
│   │   └── project-detail.css                  Project detail page
│   │
│   └── views/
│       ├── landing-modern.ejs                  ⭐ MAIN - Full landing page
│       ├── browse-modern.ejs                   Project browsing page
│       ├── project-detail-modern.ejs           Project detail page
│       │
│       └── partials/
│           ├── navbar-modern.ejs               Navigation bar
│           ├── hero-modern.ejs                 Hero section
│           ├── features-grid-modern.ejs        Features display
│           ├── how-it-works-modern.ejs         How it works section
│           ├── cta-banner-modern.ejs           CTA banner
│           └── footer-modern.ejs               Footer
│
├── UI_MIGRATION_COMPLETE.md                    📖 Full documentation
├── QUICK_INTEGRATION_GUIDE.md                  🚀 Quick start guide
└── [existing files...]
```

---

## 📊 Component Dependency Map

```
landing-modern.ejs
├── navbar-modern.ejs (included)
├── hero-modern.ejs (included)
├── features-grid-modern.ejs (included)
├── how-it-works-modern.ejs (included)
├── cta-banner-modern.ejs (included)
└── footer-modern.ejs (included)

browse-modern.ejs
├── navbar-modern.ejs (included)
├── footer-modern.ejs (included)
└── Requires: projects[] data from backend

project-detail-modern.ejs
├── navbar-modern.ejs (included)
├── footer-modern.ejs (included)
└── Requires: project{} data from backend
```

---

## 🎯 CSS Cascade

```
HTML
  ↓
projexia-design-system.css (base styles & utilities)
  ↓
Component CSS Files (navbar, hero, features, etc.)
  ↓
Inline styles (from EJS where needed)
```

---

## 📋 Data Flow

### Landing Page
```
GET / → route handler
  → no data needed
  → render landing-modern.ejs
  → includes all partials
  → return HTML to browser
```

### Browse Projects
```
GET /browse → route handler
  → fetch projects from DB
  → populate author info
  → render browse-modern.ejs
  → pass { projects, user }
  → return HTML to browser
```

### Project Detail
```
GET /project/:id → route handler
  → fetch project by ID
  → populate author & comments
  → render project-detail-modern.ejs
  → pass { project, user }
  → return HTML to browser
```

---

## 🎨 CSS File Sizes & Content

| File | Lines | Selectors | Purpose |
|------|-------|-----------|---------|
| projexia-design-system.css | 1000+ | 150+ | Core design tokens, utilities |
| navbar-modern.css | 250 | 40+ | Navigation styling |
| hero.css | 180 | 25+ | Hero section styling |
| features-grid.css | 200 | 30+ | Feature cards styling |
| how-it-works.css | 220 | 35+ | Step cards styling |
| cta-banner.css | 180 | 25+ | CTA section styling |
| footer-modern.css | 250 | 35+ | Footer styling |
| browse-projects.css | 280 | 40+ | Project grid styling |
| project-detail.css | 450 | 60+ | Detail page styling |
| **TOTAL** | **2500+** | **360+** | **All styling** |

---

## 📝 Template File Sizes

| File | Lines | Elements | Purpose |
|------|-------|----------|---------|
| landing-modern.ejs | 80 | 5 partials | Complete landing page |
| browse-modern.ejs | 150 | Dynamic grid | Project browsing |
| project-detail-modern.ejs | 250 | Dynamic details | Single project view |
| navbar-modern.ejs | 100 | Menu, avatar | Navigation |
| hero-modern.ejs | 40 | Title, buttons | Hero section |
| features-grid-modern.ejs | 80 | 6 features | Feature showcase |
| how-it-works-modern.ejs | 60 | 4 steps | Process display |
| cta-banner-modern.ejs | 40 | Banner content | Call-to-action |
| footer-modern.ejs | 70 | Links, stats | Footer |
| **TOTAL** | **900+** | **Multiple** | **All templates** |

---

## 🔗 Key Relationships

### Colors Used Across Components
```
Primary (Maroon): Nav, buttons, badges, icons
Secondary (Orange): Accents, glowing text
Muted: Backgrounds, borders
Foreground: Text, dark elements
```

### Fonts Used
```
Orbitron: Logo, main titles (h1)
Poppins: Section titles, buttons, weights
Inter: Body text, descriptions, UI labels
```

### Animations Used
```
fadeIn (0.6s): Hero content, section headers
scaleIn (0.4s): Feature cards, step cards
glow (2s): Logo secondary color, highlights
slideDown (0.3s): Dropdowns, mobile menu
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] All CSS files in `/public/css/`
- [ ] All template files in `/public/views/` and `/public/views/partials/`
- [ ] Google Fonts CDN accessible
- [ ] Routes configured in server.js
- [ ] Database models working
- [ ] User authentication working
- [ ] Environment variables set

### Testing
- [ ] Landing page loads
- [ ] Browse page displays projects
- [ ] Project detail page works
- [ ] Responsive design works on mobile
- [ ] All buttons clickable
- [ ] Forms submit correctly
- [ ] No console errors
- [ ] No CSS conflicts

### Post-Deployment
- [ ] Monitor for errors
- [ ] Check performance
- [ ] Verify responsive on real devices
- [ ] Test on different browsers

---

## 💡 Quick Reference Commands

### View file structure
```bash
find . -name "*.ejs" -o -name "*.css" | grep -E "(modern|design-system)"
```

### Check CSS files size
```bash
ls -lh public/css/*.css
```

### Check template files
```bash
ls -la public/views/
```

---

## 🎯 Next Steps

1. ✅ Files created ← You are here
2. → Copy files to your project
3. → Update routes as per QUICK_INTEGRATION_GUIDE.md
4. → Test pages locally
5. → Deploy to production
6. → Monitor and optimize

---

## 📚 Documentation Files

- **UI_MIGRATION_COMPLETE.md** - Comprehensive documentation
- **QUICK_INTEGRATION_GUIDE.md** - Quick setup instructions  
- **This File** - File structure reference

---

**All files are ready for integration! 🎉**
