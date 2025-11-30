/* ============================================
   ProjectDock - Main JavaScript File
   ============================================ */

// LocalStorage Management
const ProjectStorage = {
    getProjects: () => {
        try {
            const projects = localStorage.getItem('projectdock_projects');
            if (!projects) return [];
            const parsed = JSON.parse(projects);
            const result = Array.isArray(parsed) ? parsed : [];
            
            // Verify thumbnail data integrity
            result.forEach((project, index) => {
                if (project.thumbnail && typeof project.thumbnail === 'string') {
                    if (project.thumbnail.startsWith('data:image')) {
                        const base64Match = project.thumbnail.match(/^data:image\/(\w+);base64,(.+)$/);
                        if (base64Match && base64Match[2]) {
                            const base64Length = base64Match[2].length;
                            if (base64Length < 100) {
                                console.warn(`Project ${index} (${project.name}): Thumbnail base64 data seems corrupted (length: ${base64Length})`);
                            }
                        } else {
                            console.warn(`Project ${index} (${project.name}): Thumbnail data URL format invalid`);
                        }
                    }
                }
            });
            
            return result;
        } catch (error) {
            console.error('Error loading projects from localStorage:', error);
            return [];
        }
    },

    saveProjects: (projects) => {
        try {
            if (!Array.isArray(projects)) {
                console.error('saveProjects: projects must be an array');
                return false;
            }
            const dataStr = JSON.stringify(projects);
            localStorage.setItem('projectdock_projects', dataStr);
            return true;
        } catch (error) {
            console.error('Error saving projects to localStorage:', error);
            if (error.name === 'QuotaExceededError' || error.code === 22) {
                console.error('localStorage quota exceeded. Image data might be too large.');
                // Try saving without thumbnails as fallback
                const projectsWithoutThumbnails = projects.map(p => ({
                    ...p,
                    thumbnail: null
                }));
                try {
                    localStorage.setItem('projectdock_projects', JSON.stringify(projectsWithoutThumbnails));
                    console.warn('Saved projects without thumbnails due to size limit');
                    return true;
                } catch (e) {
                    console.error('Failed to save even without thumbnails:', e);
                }
            }
            return false;
        }
    },

    addProject: (project) => {
        const projects = ProjectStorage.getProjects();
        const newProject = {
            id: Date.now().toString(),
            ...project,
            createdAt: new Date().toISOString()
        };
        projects.push(newProject);
        const saved = ProjectStorage.saveProjects(projects);
        if (!saved) {
            console.error('Failed to save project to localStorage');
            // Remove the project from array if save failed
            projects.pop();
            return null;
        }
        console.log('Project added successfully:', newProject.id, newProject.name);
        return newProject;
    },

    updateProject: (id, updates) => {
        try {
            const projects = ProjectStorage.getProjects();
            const index = projects.findIndex(p => p.id === id);
            
            if (index === -1) {
                console.error('Project not found for update. ID:', id);
                console.error('Available project IDs:', projects.map(p => p.id));
                return null;
            }
            
            const oldProject = projects[index];
            console.log('Updating project at index:', index);
            console.log('Old project:', oldProject);
            console.log('Updates to apply:', updates);
            
            // Preserve createdAt and id, merge updates
            const updatedProject = { 
                ...oldProject,
                ...updates,
                id: oldProject.id, // Ensure ID doesn't change
                createdAt: oldProject.createdAt // Preserve creation date
            };
            
            projects[index] = updatedProject;
            
            const saved = ProjectStorage.saveProjects(projects);
            if (!saved) {
                console.error('Failed to save updated project to localStorage');
                // Restore old project if save failed
                projects[index] = oldProject;
                return null;
            }
            
            // Verify the update was saved
            const verification = ProjectStorage.getProjects();
            const verifiedProject = verification.find(p => p.id === id);
            if (!verifiedProject) {
                console.error('Update verification failed - project not found after save');
                return null;
            }
            
            console.log('Project updated successfully:', id);
            console.log('Updated project data:', verifiedProject);
            return verifiedProject;
        } catch (error) {
            console.error('Error in updateProject:', error);
            return null;
        }
    },

    deleteProject: (id) => {
        const projects = ProjectStorage.getProjects();
        const filtered = projects.filter(p => p.id !== id);
        ProjectStorage.saveProjects(filtered);
        return filtered.length < projects.length;
    },

    getProject: (id) => {
        const projects = ProjectStorage.getProjects();
        return projects.find(p => p.id === id);
    }
};

// Navigation Management
const Navigation = {
    init: () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Make nav-brand clickable to go home with logo animation
        const navBrand = document.querySelector('.nav-brand');
        const navLogo = document.getElementById('nav-logo');
        
        if (navBrand) {
            navBrand.style.cursor = 'pointer';
            navBrand.addEventListener('click', (e) => {
                // Trigger logo animation if logo exists
                if (navLogo) {
                    navLogo.classList.add('clicked');
                    setTimeout(() => {
                        navLogo.classList.remove('clicked');
                    }, 600);
                }
                // Navigate to home after a short delay to show animation
                setTimeout(() => {
                    if (window.location.pathname.split('/').pop() !== 'index.html' && 
                        !window.location.pathname.endsWith('/')) {
                        window.location.href = 'index.html';
                    }
                }, 300);
            });
        }
    },

    setupMobileMenu: () => {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Close menu when clicking on a link
            navMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }
    },

    setupScrollNavbar: () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            });
        }
    }
};

// Theme Management
const Theme = {
    init: () => {
        const savedTheme = localStorage.getItem('projectdock_theme') || 'light';
        Theme.setTheme(savedTheme);
        
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
                const newTheme = currentTheme === 'light' ? 'dark' : 'light';
                Theme.setTheme(newTheme);
            });
        }
    },

    setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('projectdock_theme', theme);
        
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.innerHTML = theme === 'light' ? '<span>🌙</span>' : '<span>☀️</span>';
        }
    }
};

// Toast Notification System
const Toast = {
    container: null,

    init: () => {
        if (!Toast.container) {
            Toast.container = document.createElement('div');
            Toast.container.className = 'toast-container';
            document.body.appendChild(Toast.container);
        }
    },

    show: (message, type = 'info', duration = 3000) => {
        Toast.init();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = Toast.getIcon(type);
        toast.innerHTML = `
            <span>${icon}</span>
            <span>${message}</span>
        `;
        
        Toast.container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.style.animation = 'slideInRight 0.3s ease';
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            toast.style.animation = 'slideInLeft 0.3s ease';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    },

    getIcon: (type) => {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
};

// Scroll Animations
const ScrollAnimations = {
    init: () => {
        const elements = document.querySelectorAll('.fade-on-scroll');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(el => observer.observe(el));
    }
};

// Counter Animation
const Counter = {
    animate: (element, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = Math.round(target);
                clearInterval(timer);
            } else {
                element.textContent = Math.round(current);
            }
        }, 16);
    },

    init: () => {
        const counters = document.querySelectorAll('.stat-number');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target') || counter.textContent);
            
            // Skip if target is 0 or not set (will be set later)
            if (!target || target === 0) {
                return;
            }
            
            // Skip if already animated to the same target
            if (counter.hasAttribute('data-animated') && 
                parseInt(counter.getAttribute('data-animated')) === target) {
                return;
            }
            
            counter.textContent = '0';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        Counter.animate(counter, target);
                        counter.setAttribute('data-animated', target.toString());
                        observer.unobserve(counter);
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(counter);
        });
    }
};

// Modal Management
const Modal = {
    open: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    },

    close: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    },

    init: () => {
        // Close on background click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    Modal.close(modal.id);
                }
            });
        });

        // Close on close button
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                if (modal) {
                    Modal.close(modal.id);
                }
            });
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.show').forEach(modal => {
                    Modal.close(modal.id);
                });
            }
        });
    }
};

// Form Validation
const FormValidator = {
    validate: (form) => {
        const inputs = form.querySelectorAll('[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                FormValidator.showError(input, 'This field is required');
                isValid = false;
            } else {
                FormValidator.clearError(input);
                
                // Email validation
                if (input.type === 'email' && !FormValidator.isValidEmail(input.value)) {
                    FormValidator.showError(input, 'Please enter a valid email');
                    isValid = false;
                }
                
                // URL validation
                if (input.type === 'url' && input.value.trim() && !FormValidator.isValidURL(input.value)) {
                    FormValidator.showError(input, 'Please enter a valid URL');
                    isValid = false;
                }
            }
        });

        return isValid;
    },

    showError: (input, message) => {
        FormValidator.clearError(input);
        input.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#f56565';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        input.parentElement.appendChild(errorDiv);
    },

    clearError: (input) => {
        input.classList.remove('error');
        const errorMsg = input.parentElement.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    },

    isValidEmail: (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isValidURL: (url) => {
        if (!url || !url.trim()) {
            return false;
        }
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
};

// Utility Functions
const Utils = {
    getStatusColor: (status) => {
        const colors = {
            'Completed': '#48bb78',
            'In Progress': '#4299e1',
            'Planned': '#ed8936',
            'On Hold': '#a0aec0'
        };
        return colors[status] || '#a0aec0';
    },

    formatDate: (dateString) => {
        if (!dateString) return 'No date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    },

    truncateText: (text, maxLength = 100) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
};

// Search and Filter
const SearchFilter = {
    filterProjects: (projects, searchTerm, category, tags = []) => {
        return projects.filter(project => {
            const matchesSearch = !searchTerm || 
                project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (project.developerName && project.developerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (project.technologies && project.technologies.some(tech => 
                    tech.toLowerCase().includes(searchTerm.toLowerCase())
                )) ||
                (project.tags && project.tags.some(tag => 
                    tag.toLowerCase().includes(searchTerm.toLowerCase())
                ));
            
            const matchesCategory = !category || project.category === category;
            
            const matchesTags = tags.length === 0 || 
                (project.tags && tags.some(tag => 
                    project.tags.some(pt => pt.toLowerCase() === tag.toLowerCase())
                ));
            
            return matchesSearch && matchesCategory && matchesTags;
        });
    },

    sortProjects: (projects, sortBy) => {
        const sorted = [...projects];
        
        switch(sortBy) {
            case 'date-newest':
                return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            case 'date-oldest':
                return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            case 'name-asc':
                return sorted.sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return sorted.sort((a, b) => b.name.localeCompare(a.name));
            default:
                return sorted;
        }
    }
};

// File Upload Preview
const FileUpload = {
    init: () => {
        const fileInputs = document.querySelectorAll('.file-upload-input');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    FileUpload.previewFile(file, input);
                }
            });
        });
    },

    previewFile: (file, input) => {
        const reader = new FileReader();
        const preview = input.closest('.file-upload').querySelector('.file-preview');
        
        if (preview) {
            reader.onload = (e) => {
                preview.src = e.target.result;
                preview.classList.add('show');
            };
            reader.readAsDataURL(file);
        }
    }
};

// Typing Animation
const TypingAnimation = {
    animate: (element, text, speed = 100) => {
        let i = 0;
        element.textContent = '';
        
        const type = () => {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        };
        
        type();
    }
};

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
    Navigation.setupMobileMenu();
    Navigation.setupScrollNavbar();
    Theme.init();
    ScrollAnimations.init();
    Counter.init();
    Modal.init();
    FileUpload.init();
    Toast.init();
});

// Export for use in other scripts
window.ProjectDock = {
    ProjectStorage,
    Navigation,
    Theme,
    Toast,
    Modal,
    FormValidator,
    SearchFilter,
    Counter,
    TypingAnimation,
    ScrollAnimations,
    Utils
};

