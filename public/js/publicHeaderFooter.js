document.addEventListener('DOMContentLoaded', () => {
    
    // ===============================
    // MODE TOGGLE
    // ===============================
    const modeToggle = document.getElementById('publicModeToggle');
    
    if (modeToggle) {
        // Update icon based on current mode
        updateModeIcon();
        
        modeToggle.addEventListener('click', () => {
            const currentMode = document.documentElement.getAttribute('data-color-mode') || 
                               localStorage.getItem('colorMode') || 
                               'light';
            const newMode = currentMode === 'dark' ? 'light' : 'dark';
            
            // Apply new mode
            document.documentElement.setAttribute('data-color-mode', newMode);
            localStorage.setItem('colorMode', newMode);
            
            // Update icon
            updateModeIcon();
        });
    }
    
    function updateModeIcon() {
        const currentMode = document.documentElement.getAttribute('data-color-mode') || 
                           localStorage.getItem('colorMode') || 
                           'light';
        
        const modeIcon = modeToggle.querySelector('.mode-icon');
        
        if (currentMode === 'dark') {
            // Show sun icon (for switching to light mode)
            modeIcon.innerHTML = `
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            `;
        } else {
            // Show moon icon (for switching to dark mode)
            modeIcon.innerHTML = `
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            `;
        }
    }
    
    // ===============================
    // LOAD STATISTICS
    // ===============================
    loadPublicStatistics();
    
    async function loadPublicStatistics() {
        try {
            // Load user and project count
            const statsResponse = await fetch('/api/footer/statistics');
            const statsData = await statsResponse.json();
            
            document.getElementById('publicUserCount').textContent = statsData.userCount || 0;
            document.getElementById('publicProjectCount').textContent = statsData.projectCount || 0;
            
            // Load average rating
            const ratingResponse = await fetch('/api/footer/rating/average');
            const ratingData = await ratingResponse.json();
            
            const averageRating = ratingData.averageRating || 0;
            const totalRatings = ratingData.totalRatings || 0;
            
            document.getElementById('publicAverageRating').textContent = averageRating.toFixed(1);
            document.getElementById('publicTotalRatings').textContent = totalRatings;
            
            // Update star display
            updateStarsDisplay(averageRating);
            
        } catch (error) {
            console.error('Error loading statistics:', error);
            document.getElementById('publicUserCount').textContent = '0';
            document.getElementById('publicProjectCount').textContent = '0';
            document.getElementById('publicAverageRating').textContent = '0.0';
            document.getElementById('publicTotalRatings').textContent = '0';
        }
    }
    
    function updateStarsDisplay(rating) {
        const stars = document.querySelectorAll('#publicRatingStars .star');
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        stars.forEach((star, index) => {
            if (index < fullStars) {
                star.classList.remove('empty');
            } else if (index === fullStars && hasHalfStar) {
                star.classList.remove('empty');
                star.style.opacity = '0.5';
            } else {
                star.classList.add('empty');
            }
        });
    }
    
    console.log('Public header/footer initialized');
});
