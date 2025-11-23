document.addEventListener('DOMContentLoaded', () => {
    // Initialize color mode toggle if Utils is available
    if (typeof Utils !== 'undefined' && Utils.initColorModeToggle) {
        Utils.initColorModeToggle();
    }

    // Get filter elements
    const searchProject = document.getElementById('searchProject');
    const filterProgram = document.getElementById('filterProgram');
    const filterYear = document.getElementById('filterYear');
    const filterTechnology = document.getElementById('filterTechnology');

    // Get all project links from all sections
    const allProjectLinks = document.querySelectorAll('.project-link');
    const techDropdown = document.getElementById('filterTechnology');
    const allTechs = new Set();
    
    // Collect all unique technologies from all projects
    allProjectLinks.forEach(link => {
        const project = link.querySelector('.project');
        const technologies = project.getAttribute('data-technologies');
        if (technologies) {
            technologies.split(',').forEach(tech => {
                if (tech.trim()) {
                    allTechs.add(tech.trim());
                }
            });
        }
    });
    
    // Sort and add to dropdown
    Array.from(allTechs).sort().forEach(tech => {
        const option = document.createElement('option');
        option.value = tech;
        option.textContent = tech;
        techDropdown.appendChild(option);
    });

    // ========================================
    // FILTER FUNCTIONALITY
    // ========================================
    function filterProjects() {
        const searchValue = searchProject.value.toLowerCase().trim();
        const programValue = filterProgram.value;
        const yearValue = filterYear.value;
        const technologyValue = filterTechnology.value;

        // Get all project links from all three sections
        const allProjectLinks = document.querySelectorAll('.project-link');
        
        let visibleCount = {
            top3: 0,
            batchmates: 0,
            all: 0
        };

        allProjectLinks.forEach(link => {
            const project = link.querySelector('.project');
            const projectName = project.getAttribute('data-project-name');
            const projectProgram = project.getAttribute('data-program');
            const projectYear = project.getAttribute('data-year');
            const projectTechnologies = project.getAttribute('data-technologies');

            // Search match
            const searchMatch = searchValue === '' || projectName.includes(searchValue);
            
            // Filter matches
            const programMatch = programValue === 'All' || projectProgram === programValue;
            const yearMatch = yearValue === 'All' || projectYear === yearValue;
            const technologyMatch = technologyValue === 'All' || 
                (projectTechnologies && projectTechnologies.split(',').includes(technologyValue));

            // Show or hide based on all filters
            if (searchMatch && programMatch && yearMatch && technologyMatch) {
                link.classList.remove('hidden');
                link.style.display = '';
                
                // Count visible projects per section
                if (link.classList.contains('top3-link')) {
                    visibleCount.top3++;
                } else if (link.closest('.section-batchmates')) {
                    visibleCount.batchmates++;
                } else if (link.closest('.section-all')) {
                    visibleCount.all++;
                }
            } else {
                link.classList.add('hidden');
                link.style.display = 'none';
            }
        });

        // Show/hide section headers based on visible projects
        updateSectionVisibility('section-top3', visibleCount.top3);
        updateSectionVisibility('section-batchmates', visibleCount.batchmates);
        updateSectionVisibility('section-all', visibleCount.all);

        // Sort visible projects by popularity within each section
        sortProjectsByPopularity();
    }

    function updateSectionVisibility(sectionClass, visibleCount) {
        const section = document.querySelector(`.${sectionClass}`);
        if (section) {
            if (visibleCount === 0) {
                section.style.display = 'none';
            } else {
                section.style.display = 'block';
            }
        }
    }

    function sortProjectsByPopularity() {
        // Sort projects in each container by popularity (descending)
        const containers = [
            document.querySelector('.top3-container'),
            document.querySelector('.batchmate-container'),
            document.querySelector('.all-projects-container')
        ];

        containers.forEach(container => {
            if (!container) return;

            const links = Array.from(container.querySelectorAll('.project-link:not(.hidden)'));
            
            // Sort by popularity
            links.sort((a, b) => {
                const popA = parseInt(a.querySelector('.project').getAttribute('data-popularity') || '0');
                const popB = parseInt(b.querySelector('.project').getAttribute('data-popularity') || '0');
                return popB - popA;
            });

            // Re-append in sorted order
            links.forEach(link => container.appendChild(link));
        });
    }

    // Event listeners for filters
    if (searchProject) {
        searchProject.addEventListener('input', filterProjects);
    }
    if (filterProgram) {
        filterProgram.addEventListener('change', filterProjects);
    }
    if (filterYear) {
        filterYear.addEventListener('change', filterProjects);
    }
    if (filterTechnology) {
        filterTechnology.addEventListener('change', filterProjects);
    }

    // ========================================
    // LAZY LOADING FOR IMAGES
    // ========================================
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // ========================================
    // SCROLL REVEAL ANIMATION
    // ========================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe cards for animation
    allProjectLinks.forEach((link, index) => {
        if (index > 5) { // Animate cards after the first 6
            link.style.opacity = '0';
            link.style.transform = 'translateY(30px)';
            link.style.transition = 'all 0.6s ease';
            cardObserver.observe(link);
        }
    });

    console.log('Home page initialized with filters');
});
