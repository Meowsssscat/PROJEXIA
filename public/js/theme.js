// Theme switching functionality - Apply to entire document
(function() {
  'use strict';

  // Get the current theme from localStorage or system preference
  function getTheme() {
    const stored = localStorage.getItem('projexia-theme');
    if (stored) return stored;
    
    // Default to light (no system preference check)
    return 'light';
  }

  // Apply theme to document root (synchronously, no delays)
  function applyTheme(theme) {
    const html = document.documentElement;
    const body = document.body;
    
    if (theme === 'dark') {
      html.classList.add('dark');
      if (body) body.classList.add('dark');
      html.setAttribute('data-theme', 'dark');
      html.style.colorScheme = 'dark';
      localStorage.setItem('projexia-theme', 'dark');
    } else {
      html.classList.remove('dark');
      if (body) body.classList.remove('dark');
      html.removeAttribute('data-theme');
      html.style.colorScheme = 'light';
      localStorage.setItem('projexia-theme', 'light');
    }
    
    // Update theme toggle button if it exists
    updateThemeButton(theme);
  }

  // Update the theme toggle button UI (both desktop and mobile)
  function updateThemeButton(theme) {
    const toggleButton = document.getElementById('themeToggle');
    const toggleButtonMobile = document.getElementById('themeToggleMobile');
    
    // Update desktop button
    if (toggleButton) {
      const sunIcon = toggleButton.querySelector('.sun-icon');
      const moonIcon = toggleButton.querySelector('.moon-icon');
      
      if (theme === 'dark') {
        toggleButton.setAttribute('aria-label', 'Switch to light mode');
        if (sunIcon) {
          sunIcon.style.display = 'none';
          sunIcon.classList.add('hidden');
        }
        if (moonIcon) {
          moonIcon.style.display = 'inline-block';
          moonIcon.classList.remove('hidden');
        }
      } else {
        toggleButton.setAttribute('aria-label', 'Switch to dark mode');
        if (sunIcon) {
          sunIcon.style.display = 'inline-block';
          sunIcon.classList.remove('hidden');
        }
        if (moonIcon) {
          moonIcon.style.display = 'none';
          moonIcon.classList.add('hidden');
        }
      }
    }
    
    // Update mobile button
    if (toggleButtonMobile) {
      const sunIconMobile = toggleButtonMobile.querySelector('.sun-icon');
      const moonIconMobile = toggleButtonMobile.querySelector('.moon-icon');
      
      if (theme === 'dark') {
        toggleButtonMobile.setAttribute('aria-label', 'Switch to light mode');
        if (sunIconMobile) {
          sunIconMobile.style.display = 'none';
          sunIconMobile.classList.add('hidden');
        }
        if (moonIconMobile) {
          moonIconMobile.style.display = 'inline-block';
          moonIconMobile.classList.remove('hidden');
        }
      } else {
        toggleButtonMobile.setAttribute('aria-label', 'Switch to dark mode');
        if (sunIconMobile) {
          sunIconMobile.style.display = 'inline-block';
          sunIconMobile.classList.remove('hidden');
        }
        if (moonIconMobile) {
          moonIconMobile.style.display = 'none';
          moonIconMobile.classList.add('hidden');
        }
      }
    }
  }

  // Toggle theme
  function toggleTheme() {
    const current = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    const newTheme = current === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
  }

  // Apply theme IMMEDIATELY before any page rendering (synchronous)
  const theme = getTheme();
  const html = document.documentElement;
  
  if (theme === 'dark') {
    html.classList.add('dark');
    html.style.colorScheme = 'dark';
  } else {
    html.style.colorScheme = 'light';
  }

  // Initialize theme on page load (DOMContentLoaded)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTheme);
  } else {
    initializeTheme();
  }

  function initializeTheme() {
    const theme = getTheme();
    applyTheme(theme);
    
    // Set up desktop theme toggle button
    const toggleButton = document.getElementById('themeToggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', toggleTheme);
      // Update button immediately
      updateThemeButton(theme);
    }
    
    // Set up mobile theme toggle button
    const toggleButtonMobile = document.getElementById('themeToggleMobile');
    if (toggleButtonMobile) {
      toggleButtonMobile.addEventListener('click', toggleTheme);
      // Update button immediately
      updateThemeButton(theme);
    }
  }

  // Expose toggle function globally
  window.toggleTheme = toggleTheme;
})();
