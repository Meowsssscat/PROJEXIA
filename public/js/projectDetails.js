document.addEventListener('DOMContentLoaded', () => {
    // Get project ID from URL
    const projectId = window.location.pathname.split('/').pop();

    // Elements
    const likeButton = document.getElementById('likeButton');
    const commentInput = document.getElementById('commentInput');
    const submitCommentBtn = document.getElementById('submitComment');
    const commentsList = document.getElementById('commentsList');
    const commentCountSpan = document.getElementById('commentCount');

    // Record view when page loads
    recordView();

    // Like button functionality
    if (likeButton) {
        likeButton.addEventListener('click', toggleLike);
    }

    // Submit comment functionality
    if (submitCommentBtn) {
        submitCommentBtn.addEventListener('click', submitComment);
    }

    // Enable submit on Enter (with Shift+Enter for new line)
    if (commentInput) {
        commentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitComment();
            }
        });
    }

    // Delete comment functionality (event delegation)
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-delete-comment')) {
            const commentId = e.target.dataset.commentId;
            await deleteComment(commentId);
        }
    });

    // Gallery lightbox functionality
    initGalleryLightbox();

    // Delete project functionality
    const deleteBtn = document.querySelector('.btn-delete-project');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteProject);
    }

    // Edit modal functionality
    const editModal = document.getElementById('editModal');
    const openEditModalBtn = document.getElementById('openEditModal');
    const closeModalBtn = document.querySelector('.modal-close');
    const cancelEditBtn = document.getElementById('cancelEdit');
    const editForm = document.getElementById('editProjectForm');

    if (openEditModalBtn) {
        openEditModalBtn.addEventListener('click', openEditModal);
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeEditModal);
    }

    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditModal);
    }

    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                closeEditModal();
            }
        });
    }

    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }

    /**
     * Open edit modal
     */
    function openEditModal() {
        if (editModal) {
            editModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Close edit modal
     */
    function closeEditModal() {
        if (editModal) {
            editModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Handle edit form submission
     */
    async function handleEditSubmit(e) {
        e.preventDefault();

        const formData = new FormData(editForm);
        const description = formData.get('description').trim();
        const githubLink = formData.get('githubLink').trim();
        const websiteLink = formData.get('websiteLink').trim();

        if (!description) {
            await Modal.alert('Description is required', 'warning');
            return;
        }

        const saveBtn = editForm.querySelector('.btn-save');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description,
                    githubLink,
                    websiteLink
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update description on page
                const descriptionEl = document.querySelector('.project-description p');
                if (descriptionEl) {
                    descriptionEl.textContent = description;
                }

                // Update GitHub link
                const githubLinkEl = document.querySelector('.github-link');
                if (githubLink) {
                    if (githubLinkEl) {
                        githubLinkEl.href = githubLink;
                    } else {
                        // Add link if it didn't exist
                        addProjectLink(githubLink, 'github');
                    }
                } else if (githubLinkEl) {
                    githubLinkEl.remove();
                }

                // Update Website link
                const websiteLinkEl = document.querySelector('.website-link');
                if (websiteLink) {
                    if (websiteLinkEl) {
                        websiteLinkEl.href = websiteLink;
                    } else {
                        // Add link if it didn't exist
                        addProjectLink(websiteLink, 'website');
                    }
                } else if (websiteLinkEl) {
                    websiteLinkEl.remove();
                }

                closeEditModal();
                await Modal.alert('Project updated successfully!', 'success');
            } else {
                await Modal.alert(data.error || 'Failed to update project', 'error');
            }
        } catch (error) {
            console.error('Error updating project:', error);
            await Modal.alert('Failed to update project. Please try again.', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
        }
    }

    /**
     * Add project link dynamically
     */
    function addProjectLink(url, type) {
        const linksContainer = document.querySelector('.links-container');
        if (!linksContainer) return;

        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = `project-link ${type}-link`;

        if (type === 'github') {
            link.innerHTML = `
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View on GitHub
            `;
        } else {
            link.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
                Visit Website
            `;
        }

        linksContainer.appendChild(link);
    }

    /**
     * Delete project
     */
    async function deleteProject() {
    const confirmed = await Modal.confirm(
        'Are you sure you want to delete this project? This action cannot be undone.',
        'Delete Project',
        'Delete',
        'Cancel'
    );
    
    if (!confirmed) return;

    console.log('🗑️ Starting project deletion...');
    console.log('Toast object:', typeof Toast);
    
    // Show loading toast
    let loadingToast = null;
    try {
        if (typeof Toast !== 'undefined' && Toast.info) {
            loadingToast = Toast.info('Deleting project and images...', '', 0); // 0 = no auto-dismiss
            console.log('✅ Loading toast created:', loadingToast);
        } else {
            console.error('❌ Toast object not available');
        }
    } catch (err) {
        console.error('❌ Error creating toast:', err);
    }

    try {
        const response = await fetch(`/api/projects/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        // Remove loading toast by manipulating DOM
        if (loadingToast && loadingToast.parentNode) {
            loadingToast.style.transform = 'translateY(-20px)';
            loadingToast.style.opacity = '0';
            setTimeout(() => {
                if (loadingToast.parentNode) {
                    loadingToast.parentNode.removeChild(loadingToast);
                }
            }, 300);
        }

        if (response.ok) {
            Toast.success('Project deleted successfully!');
            
            // Redirect after short delay
            setTimeout(() => {
                // Check referrer and redirect with reload
                const referrer = document.referrer;
                if (referrer.includes('/profile')) {
                    window.location.href = '/profile';
                } else if (referrer.includes('/browse')) {
                    window.location.href = '/browse';
                } else {
                    window.location.href = '/home';
                }
            }, 1000);
        } else {
            Toast.error(data.error || 'Failed to delete project');
        }
    } catch (error) {
        // Remove loading toast
        if (loadingToast && loadingToast.parentNode) {
            loadingToast.style.transform = 'translateY(-20px)';
            loadingToast.style.opacity = '0';
            setTimeout(() => {
                if (loadingToast.parentNode) {
                    loadingToast.parentNode.removeChild(loadingToast);
                }
            }, 300);
        }
        
        console.error('Error deleting project:', error);
        Toast.error('Failed to delete project. Please try again.');
    }
}
    /**
     * Record a view for this project
     */
    async function recordView() {
        try {
            await fetch(`/api/projects/${projectId}/view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error recording view:', error);
        }
    }

    /**
     * Toggle like on project
     */
    async function toggleLike() {
        try {
            const response = await fetch(`/api/projects/${projectId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                // Update button state
                if (data.liked) {
                    likeButton.classList.add('liked');
                    const likeIcon = likeButton.querySelector('.like-icon');
                    likeIcon.setAttribute('fill', 'currentColor');
                } else {
                    likeButton.classList.remove('liked');
                    const likeIcon = likeButton.querySelector('.like-icon');
                    likeIcon.setAttribute('fill', 'none');
                }

                // Update like count in stats
                const statCount = document.querySelector('.stat-item:first-child .stat-count');
                if (statCount) {
                    statCount.textContent = data.likeCount;
                }

                // Add animation
                likeButton.style.animation = 'heartBeat 0.5s ease';
                setTimeout(() => {
                    likeButton.style.animation = '';
                }, 500);
            } else {
                if (response.status === 401) {
                    await Modal.alert('Please sign in to like projects', 'warning');
                    window.location.href = '/signin';
                } else {
                    await Modal.alert(data.error || 'Failed to toggle like', 'error');
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            await Modal.alert('Failed to toggle like. Please try again.', 'error');
        }
    }

    /**
     * Submit a new comment
     */
    async function submitComment() {
        const text = commentInput.value.trim();

        if (!text) {
            await Modal.alert('Please write a comment', 'warning');
            return;
        }

        submitCommentBtn.disabled = true;
        submitCommentBtn.textContent = 'Posting...';

        try {
            const response = await fetch(`/api/projects/${projectId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            const data = await response.json();

            if (response.ok) {
                // Clear input
                commentInput.value = '';

                // Add new comment to the list
                addCommentToDOM(data.comment);

                // Update comment count
                commentCountSpan.textContent = data.commentCount;

                // Update comment count in stats
                const statCount = document.querySelectorAll('.stat-item')[1].querySelector('.stat-count');
                if (statCount) {
                    statCount.textContent = data.commentCount;
                }
            } else {
                if (response.status === 401) {
                    await Modal.alert('Please sign in to comment', 'warning');
                    window.location.href = '/signin';
                } else {
                    await Modal.alert(data.error || 'Failed to post comment', 'error');
                }
            }
        } catch (error) {
            console.error('Error posting comment:', error);
            await Modal.alert('Failed to post comment. Please try again.', 'error');
        } finally {
            submitCommentBtn.disabled = false;
            submitCommentBtn.textContent = 'Post Comment';
        }
    }

    /**
     * Delete a comment
     */
    async function deleteComment(commentId) {
        const confirmed = await Modal.confirm(
            'Are you sure you want to delete this comment?',
            'Delete',
            'Cancel'
        );
        if (!confirmed) return;

        try {
            const response = await fetch(`/api/projects/${projectId}/comment/${commentId}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Remove comment from DOM
                const commentElement = document.getElementById(`comment-${commentId}`);
                if (commentElement) {
                    commentElement.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => {
                        commentElement.remove();
                    }, 300);
                }

                // Update comment count
                commentCountSpan.textContent = result.commentCount;

                // Update comment count in stats
                const statCount = document.querySelectorAll('.stat-item')[1].querySelector('.stat-count');
                if (statCount) {
                    statCount.textContent = result.commentCount;
                }
            } else {
                await Modal.alert(result.error || 'Failed to delete comment', 'error');
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
            await Modal.alert('Failed to delete comment', 'error');
        }
    }

    /**
     * Add comment to DOM
     */
    function addCommentToDOM(comment) {
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';
        commentItem.id = `comment-${comment._id}`;

        const commentDate = new Date(comment.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        commentItem.innerHTML = `
            <div class="comment-avatar">
                ${comment.userId.fullName.charAt(0).toUpperCase()}
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <span class="comment-author">${comment.userId.fullName}</span>
                    <span class="comment-meta">${comment.userId.program} - ${comment.userId.year} Year</span>
                    <span class="comment-date">${commentDate}</span>
                    <button class="btn-delete-comment" data-comment-id="${comment._id}">Delete</button>
                </div>
                <p class="comment-text">${comment.text}</p>
            </div>
        `;

        // Add to top of comments list
        commentsList.insertBefore(commentItem, commentsList.firstChild);

        // Add entrance animation
        commentItem.style.animation = 'slideIn 0.3s ease';
    }

    /**
     * Initialize gallery lightbox
     */
    function initGalleryLightbox() {
        const galleryItems = document.querySelectorAll('.gallery-item');

        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                openLightbox(img.src, img.alt);
            });
        });
    }

    /**
     * Open image in lightbox
     */
    function openLightbox(src, alt) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <span class="lightbox-close">&times;</span>
                <img src="${src}" alt="${alt}">
            </div>
        `;

        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';

        // Close lightbox
        const closeBtn = lightbox.querySelector('.lightbox-close');
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        function closeLightbox() {
            lightbox.remove();
            document.body.style.overflow = '';
        }

        // ESC key to close
        document.addEventListener('keydown', function handleEsc(e) {
            if (e.key === 'Escape') {
                closeLightbox();
                document.removeEventListener('keydown', handleEsc);
            }
        });
    }
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes heartBeat {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.3); }
        50% { transform: scale(1.1); }
        75% { transform: scale(1.2); }
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-20px);
        }
    }

    .lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(20, 20, 20, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
    }

    .lightbox-content img {
        max-width: 100%;
        max-height: 90vh;
        object-fit: contain;
        border-radius: 8px;
    }

    .lightbox-close {
        position: absolute;
        top: -40px;
        right: 0;
        color: white;
        font-size: 2rem;
        font-weight: bold;
        cursor: pointer;
        transition: color 0.3s ease;
    }

    .lightbox-close:hover {
        color: var(--color-accent);
    }
`;
document.head.appendChild(style);