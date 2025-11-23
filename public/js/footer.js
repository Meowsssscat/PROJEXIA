document.addEventListener('DOMContentLoaded', () => {
    
    // Elements
    const reportIssueBtn = document.getElementById('reportIssueBtn');
    const reportIssueModal = document.getElementById('reportIssueModal');
    const closeReportModal = document.getElementById('closeReportModal');
    const cancelReport = document.getElementById('cancelReport');
    const reportIssueForm = document.getElementById('reportIssueForm');
    
    const rateBtn = document.getElementById('rateBtn');
    const ratingModal = document.getElementById('ratingModal');
    const closeRatingModal = document.getElementById('closeRatingModal');
    const cancelRating = document.getElementById('cancelRating');
    const starsInput = document.getElementById('starsInput');
    const ratingLabel = document.getElementById('ratingLabel');
    const submitRating = document.getElementById('submitRating');
    
    let selectedRating = 0;

    // ===============================
    // LOAD STATISTICS
    // ===============================
    loadStatistics();
    loadAverageRating();
    loadUserRating();

    async function loadStatistics() {
        try {
            const response = await fetch('/api/footer/statistics');
            const data = await response.json();
            
            document.getElementById('userCount').textContent = data.userCount || 0;
            document.getElementById('projectCount').textContent = data.projectCount || 0;
        } catch (error) {
            console.error('Error loading statistics:', error);
            document.getElementById('userCount').textContent = '0';
            document.getElementById('projectCount').textContent = '0';
        }
    }

    async function loadAverageRating() {
        try {
            const response = await fetch('/api/footer/rating/average');
            const data = await response.json();
            
            const averageRating = data.averageRating || 0;
            const totalRatings = data.totalRatings || 0;
            
            document.getElementById('averageRating').textContent = averageRating.toFixed(1);
            document.getElementById('totalRatings').textContent = totalRatings;
            
            // Update stars display
            updateStarsDisplay(averageRating);
        } catch (error) {
            console.error('Error loading ratings:', error);
        }
    }

    async function loadUserRating() {
        try {
            const response = await fetch('/api/footer/rating/user');
            const data = await response.json();
            
            if (data.rating) {
                selectedRating = data.rating;
            }
        } catch (error) {
            console.error('Error loading user rating:', error);
        }
    }

    function updateStarsDisplay(rating) {
        const stars = document.querySelectorAll('#averageStars .star');
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

    // ===============================
    // REPORT ISSUE MODAL
    // ===============================
    if (reportIssueBtn) {
        reportIssueBtn.addEventListener('click', () => {
            reportIssueModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeReportModal) {
        closeReportModal.addEventListener('click', closeReportModalFn);
    }

    if (cancelReport) {
        cancelReport.addEventListener('click', closeReportModalFn);
    }

    if (reportIssueModal) {
        reportIssueModal.addEventListener('click', (e) => {
            if (e.target === reportIssueModal) {
                closeReportModalFn();
            }
        });
    }

    function closeReportModalFn() {
        reportIssueModal.classList.remove('active');
        document.body.style.overflow = '';
        reportIssueForm.reset();
    }

    // ===============================
    // SUBMIT ISSUE REPORT
    // ===============================
    if (reportIssueForm) {
        reportIssueForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const subject = document.getElementById('issueSubject').value.trim();
            const description = document.getElementById('issueDescription').value.trim();
            
            if (!subject || !description) {
                await Modal.alert('Please fill in all fields', 'warning');
                return;
            }
            
            const submitBtn = reportIssueForm.querySelector('.btn-submit');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            
            try {
                const response = await fetch('/api/footer/report-issue', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ subject, description })
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    await Modal.alert(data.message, 'success');
                    closeReportModalFn();
                } else {
                    await Modal.alert(data.error || 'Failed to submit report', 'error');
                }
            } catch (error) {
                console.error('Error submitting report:', error);
                await Modal.alert('Failed to submit report. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Report';
            }
        });
    }

    // ===============================
    // RATING MODAL
    // ===============================
    if (rateBtn) {
        rateBtn.addEventListener('click', () => {
            ratingModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Set current rating if exists
            if (selectedRating > 0) {
                updateRatingInput(selectedRating);
            }
        });
    }

    if (closeRatingModal) {
        closeRatingModal.addEventListener('click', closeRatingModalFn);
    }

    if (cancelRating) {
        cancelRating.addEventListener('click', closeRatingModalFn);
    }

    if (ratingModal) {
        ratingModal.addEventListener('click', (e) => {
            if (e.target === ratingModal) {
                closeRatingModalFn();
            }
        });
    }

    function closeRatingModalFn() {
        ratingModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ===============================
    // RATING INPUT
    // ===============================
    if (starsInput) {
        const starInputs = starsInput.querySelectorAll('.star-input');
        
        starInputs.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                selectedRating = rating;
                updateRatingInput(rating);
                submitRating.disabled = false;
            });
            
            star.addEventListener('mouseenter', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                highlightStars(rating);
            });
        });
        
        starsInput.addEventListener('mouseleave', () => {
            if (selectedRating > 0) {
                highlightStars(selectedRating);
            } else {
                highlightStars(0);
            }
        });
    }

    function highlightStars(rating) {
        const starInputs = starsInput.querySelectorAll('.star-input');
        starInputs.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    function updateRatingInput(rating) {
        selectedRating = rating;
        highlightStars(rating);
        
        const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
        ratingLabel.textContent = `${labels[rating]} (${rating} star${rating > 1 ? 's' : ''})`;
        
        submitRating.disabled = false;
    }

    // ===============================
    // SUBMIT RATING
    // ===============================
    if (submitRating) {
        submitRating.addEventListener('click', async () => {
            if (selectedRating === 0) {
                await Modal.alert('Please select a rating', 'warning');
                return;
            }
            
            submitRating.disabled = true;
            submitRating.textContent = 'Submitting...';
            
            try {
                const response = await fetch('/api/footer/rating', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ rating: selectedRating })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    await Modal.alert(data.message, 'success');
                    closeRatingModalFn();
                    loadAverageRating(); // Refresh average rating
                } else {
                    await Modal.alert(data.error || 'Failed to submit rating', 'error');
                }
            } catch (error) {
                console.error('Error submitting rating:', error);
                await Modal.alert('Failed to submit rating. Please try again.', 'error');
            } finally {
                submitRating.disabled = false;
                submitRating.textContent = 'Submit Rating';
            }
        });
    }

    // ===============================
    // ESC KEY TO CLOSE MODALS
    // ===============================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (reportIssueModal.classList.contains('active')) {
                closeReportModalFn();
            }
            if (ratingModal.classList.contains('active')) {
                closeRatingModalFn();
            }
        }
    });

    console.log('Footer initialized');
});
