// Liked Projects System
(function() {
  'use strict';

  // Setup liked projects panel
  function setupLikedProjectsPanel() {
    const likedBtn = document.getElementById('likedProjectsBtn');
    const likedBtnMobile = document.getElementById('likedProjectsBtnMobileTop');
    const panel = document.getElementById('likedProjectsPanel');

    if (!panel) return;

    // Toggle function
    function togglePanel(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const isHidden = panel.style.display === 'none' || !panel.style.display;
      panel.style.display = isHidden ? 'flex' : 'none';
      
      if (isHidden) {
        loadLikedProjects();
      }
    }

    // Desktop button
    if (likedBtn) {
      likedBtn.addEventListener('click', togglePanel);
    }

    // Mobile button
    if (likedBtnMobile) {
      likedBtnMobile.addEventListener('click', togglePanel);
    }

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (panel && 
          panel.style.display === 'flex' &&
          !e.target.closest('.navbar-likes-wrapper') &&
          !e.target.closest('.navbar-likes-btn-mobile-top') &&
          !e.target.closest('.navbar-likes-panel')) {
        panel.style.display = 'none';
      }
    });
  }

  // Load liked projects
  async function loadLikedProjects() {
    try {
      const response = await fetch('/api/liked-projects');
      if (!response.ok) throw new Error('Failed to fetch liked projects');
      
      const data = await response.json();
      displayLikedProjects(data.projects || []);
      updateLikedCount(data.projects?.length || 0);
    } catch (err) {
      console.error('Error loading liked projects:', err);
      showLikedProjectsError();
    }
  }

  // Display liked projects
  function displayLikedProjects(projects) {
    const list = document.getElementById('likedProjectsList');
    if (!list) return;

    if (!projects || projects.length === 0) {
      list.innerHTML = '<div class="navbar-liked-project-empty">No liked projects yet</div>';
      return;
    }

    list.innerHTML = projects.map(project => `
      <div class="navbar-liked-project-item" onclick="window.location.href='/project/${project._id}'">
        <img src="${project.thumbnailUrl?.url || '/images/default-project.png'}" 
             alt="${project.name}" 
             class="navbar-liked-project-thumbnail">
        <div class="navbar-liked-project-content">
          <p class="navbar-liked-project-title">${project.name}</p>
          <p class="navbar-liked-project-author">by ${project.uploaderName || 'Anonymous'}</p>
        </div>
      </div>
    `).join('');
  }

  // Update liked count in header
  function updateLikedCount(count) {
    const countSpan = document.getElementById('likedProjectsCount');
    if (countSpan) {
      countSpan.textContent = `(${count})`;
    }
  }

  // Show error message
  function showLikedProjectsError() {
    const list = document.getElementById('likedProjectsList');
    if (list) {
      list.innerHTML = '<div class="navbar-liked-project-empty">Failed to load liked projects</div>';
    }
  }

  // Initialize
  function init() {
    setupLikedProjectsPanel();
    
    // Only load projects if panel exists (user is logged in)
    const panel = document.getElementById('likedProjectsPanel');
    if (panel) {
      loadLikedProjects();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
