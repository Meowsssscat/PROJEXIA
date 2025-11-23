document.addEventListener('DOMContentLoaded', () => {
    Utils.initColorModeToggle();

    const user = Utils.getLocalStorage('user');
    const isAuthed = Utils.getLocalStorage('isAuthenticated');
    if (!isAuthed || !user) {
        window.location.href = '/signin';
        return;
    }

    const form = document.getElementById('uploadForm');
    const submitBtnId = 'submitBtn';
    const loadingId = 'loading';

    // Check project limit on page load
    checkProjectLimit();

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        Utils.hideMessage('errorMessage');
        Utils.hideMessage('successMessage');

        const data = collectFormData(user.id || user._id);
        const validationError = validateUploadData(data);
        if (validationError) {
            Utils.showError('errorMessage', validationError);
            return;
        }

        // Validate image limits
        const thumbInput = document.getElementById('thumbnail');
        const imagesInput = document.getElementById('images');
        
        if (!thumbInput || !thumbInput.files || !thumbInput.files[0]) {
            if (typeof Modal !== 'undefined') {
                await Modal.alert('Thumbnail image is required', 'warning');
            }
            return;
        }

        if (!imagesInput || !imagesInput.files || imagesInput.files.length === 0) {
            if (typeof Modal !== 'undefined') {
                await Modal.alert('At least 1 project image is required (maximum 5)', 'warning');
            }
            return;
        }

        if (imagesInput.files.length > 5) {
            if (typeof Modal !== 'undefined') {
                await Modal.alert('You can only upload up to 5 project images', 'warning');
            }
            return;
        }

        Utils.showLoading(submitBtnId, loadingId);

        const fd = new FormData();
        fd.append('userId', data.userId);
        fd.append('name', data.name);
        fd.append('description', data.description || '');
        data.developers.forEach(d => fd.append('developers[]', d));
        data.technologies.forEach(t => fd.append('technologies[]', t));

        fd.append('thumbnail', thumbInput.files[0]);
        
        if (imagesInput && imagesInput.files && imagesInput.files.length) {
            // Limit to 5 images
            const imagesToUpload = Array.from(imagesInput.files).slice(0, 5);
            imagesToUpload.forEach(f => fd.append('images', f));
        }

        let res;
        try {
            const response = await fetch('/api/projects', { method: 'POST', body: fd });
            const dataJson = await response.json();
            res = { success: response.ok, data: dataJson };
        } catch (err) {
            res = { success: false, data: { message: 'Network error' } };
        }

        Utils.hideLoading(submitBtnId, loadingId);

        if (res.success) {
            Utils.showSuccess('successMessage', 'Project uploaded successfully.');
            setTimeout(() => {
                window.location.href = '/profile';
            }, 800);
        } else {
            Utils.showError('errorMessage', res.data?.message || 'Upload failed.');
        }
    });
});

function collectFormData(userId) {
    const projectName = document.getElementById('projectName').value.trim();
    const description = document.getElementById('description').value.trim();
    const developersRaw = document.getElementById('developers').value.trim();
    const githubLink = document.getElementById('githubLink').value.trim();
    const websiteLink = document.getElementById('websiteLink').value.trim();

    const toArray = (str) =>
        str
          ? str.split(',').map(s => s.trim()).filter(Boolean)
          : [];

    // Get selected technologies
    let techList = Array.from(selectedTechs);
    
    // If "Others" is selected, add custom technologies
    if (selectedTechs.has('Others')) {
        const otherTech = document.getElementById('otherTech').value.trim();
        if (otherTech) {
            const otherTechs = toArray(otherTech);
            techList = techList.filter(t => t !== 'Others').concat(otherTechs);
        } else {
            techList = techList.filter(t => t !== 'Others');
        }
    }

    return {
        userId,
        name: projectName,
        description,
        developers: toArray(developersRaw),
        technologies: techList,
        githubLink,
        websiteLink
    };
}

function validateUploadData(d) {
    if (!d.name) return 'Project name is required';
    if (!Array.isArray(d.developers) || d.developers.length === 0) return 'At least one developer is required';
    if (!Array.isArray(d.technologies) || d.technologies.length === 0) return 'Please select at least one technology';
    if (!d.userId) return 'Missing user identification';
    
    // Check if "Others" is selected but no custom tech specified
    if (selectedTechs.has('Others')) {
        const otherTech = document.getElementById('otherTech').value.trim();
        if (!otherTech) {
            return 'Please specify other technologies or uncheck "Others"';
        }
    }
    
    return null;
}

async function checkProjectLimit() {
    const user = Utils.getLocalStorage('user');
    const submitBtn = document.getElementById('submitBtn');
    const form = document.getElementById('uploadForm');
    
    try {
        const userId = user.id || user._id;
        const response = await fetch(`/api/projects?userId=${userId}`);
        const projects = await response.json();
        
        if (projects.length >= 5) {
            Utils.showError('errorMessage', 
                `You have reached the maximum limit of 5 projects. Please delete a project from your profile before uploading a new one.`
            );
            submitBtn.disabled = true;
            submitBtn.textContent = 'Project Limit Reached (5/5)';
            submitBtn.style.cursor = 'not-allowed';
            submitBtn.style.opacity = '0.6';
            
            // Disable form inputs
            const inputs = form.querySelectorAll('input, textarea, button:not(#submitBtn)');
            inputs.forEach(input => {
                if (input.id !== 'submitBtn') {
                    input.disabled = true;
                }
            });
        } else {
            // Show remaining slots
            const remaining = 5 - projects.length;
            const infoMessage = document.createElement('div');
            infoMessage.style.cssText = 'background: rgba(240, 140, 65, 0.1); color: #141414; padding: 1rem; border-radius: 10px; margin-bottom: 1rem; border-left: 4px solid #f08c41;';
            infoMessage.innerHTML = `<strong>📊 Project Slots:</strong> ${projects.length}/5 used. You have ${remaining} slot${remaining !== 1 ? 's' : ''} remaining.`;
            form.insertBefore(infoMessage, form.firstChild);
        }
    } catch (error) {
        console.error('Error checking project limit:', error);
    }
}


    // Technology options
    const technologies = [
        'HTML', 'CSS', 'JavaScript', 'PHP', 'Python', 'Java', 'C++', 'C#',
        'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Laravel', 'Django',
        'MySQL', 'MongoDB', 'PostgreSQL', 'Firebase', 'Bootstrap', 'Tailwind',
        'jQuery', 'TypeScript', 'Flutter', 'React Native', 'Unity', 'ASP.NET',
        'Spring Boot', 'Flask', 'FastAPI', 'Next.js', 'Nuxt.js', 'Svelte',
        'Redux', 'GraphQL', 'REST API', 'Docker', 'Git', 'Others'
    ];

    const techModal = document.getElementById('techModal');
    const techGrid = document.getElementById('techGrid');
    const techSearch = document.getElementById('techSearch');
    const openTechModalBtn = document.getElementById('openTechModal');
    const closeTechModalBtn = document.getElementById('closeTechModal');
    const cancelTechModalBtn = document.getElementById('cancelTechModal');
    const confirmTechModalBtn = document.getElementById('confirmTechModal');
    const selectedTechsDisplay = document.getElementById('selectedTechsDisplay');
    const techBtnText = document.getElementById('techBtnText');
    const otherTechGroup = document.getElementById('otherTechGroup');
    const otherTechInput = document.getElementById('otherTech');
    const selectedTechs = new Set();
    let allCheckboxes = [];

    // Populate technology checkboxes
    function populateTechnologies() {
        techGrid.innerHTML = '';
        technologies.forEach(tech => {
            const label = document.createElement('label');
            label.className = 'tech-checkbox';
            label.setAttribute('data-tech', tech.toLowerCase());
            label.innerHTML = `
                <input type="checkbox" value="${tech}" ${selectedTechs.has(tech) ? 'checked' : ''} />
                <span>${tech}</span>
            `;
            techGrid.appendChild(label);

            const checkbox = label.querySelector('input');
            allCheckboxes.push({ label, checkbox, tech });
            
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedTechs.add(tech);
                    if (tech === 'Others') {
                        otherTechGroup.style.display = 'block';
                    }
                } else {
                    selectedTechs.delete(tech);
                    if (tech === 'Others') {
                        otherTechGroup.style.display = 'none';
                        otherTechInput.value = '';
                    }
                }
            });
        });
    }

    populateTechnologies();

    // Open modal
    openTechModalBtn.addEventListener('click', () => {
        techModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        techSearch.focus();
    });

    // Close modal
    function closeTechModal() {
        techModal.classList.remove('active');
        document.body.style.overflow = '';
        techSearch.value = '';
        filterTechnologies('');
    }

    closeTechModalBtn.addEventListener('click', closeTechModal);
    cancelTechModalBtn.addEventListener('click', closeTechModal);

    // Confirm selection
    confirmTechModalBtn.addEventListener('click', () => {
        updateSelectedDisplay();
        closeTechModal();
    });

    // Search functionality
    techSearch.addEventListener('input', (e) => {
        filterTechnologies(e.target.value);
    });

    function filterTechnologies(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        allCheckboxes.forEach(({ label, tech }) => {
            if (tech.toLowerCase().includes(term)) {
                label.style.display = 'flex';
            } else {
                label.style.display = 'none';
            }
        });
    }

    // Update selected technologies display
    function updateSelectedDisplay() {
        selectedTechsDisplay.innerHTML = '';
        
        if (selectedTechs.size === 0) {
            techBtnText.textContent = 'Select Technologies';
            return;
        }

        techBtnText.textContent = `${selectedTechs.size} selected`;
        
        selectedTechs.forEach(tech => {
            const tag = document.createElement('div');
            tag.className = 'tech-tag';
            tag.innerHTML = `
                <span>${tech}</span>
                <button type="button" onclick="removeTech('${tech}')">&times;</button>
            `;
            selectedTechsDisplay.appendChild(tag);
        });
    }

    // Remove technology
    window.removeTech = function(tech) {
        selectedTechs.delete(tech);
        updateSelectedDisplay();
        
        // Uncheck in modal
        allCheckboxes.forEach(({ checkbox, tech: t }) => {
            if (t === tech) {
                checkbox.checked = false;
            }
        });
        
        if (tech === 'Others') {
            otherTechGroup.style.display = 'none';
            otherTechInput.value = '';
        }
    };

    // Image counter
    const imagesInput = document.getElementById('images');
    const imageCounter = document.getElementById('imageCount');
    
    if (imagesInput && imageCounter) {
        imagesInput.addEventListener('change', (e) => {
            const count = e.target.files.length;
            imageCounter.textContent = `${count}/5 images selected`;
            imageCounter.style.color = count > 5 ? 'var(--accent)' : count > 0 ? '#28a745' : 'var(--neutral)';
        });
    }
