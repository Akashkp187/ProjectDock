/* ============================================
   ProjectDock - Shared Components
   ============================================ */

// SVG Logo Component
const LogoComponent = {
    render: () => {
        return `
            <svg class="dock-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect class="dock-base" x="2" y="20" width="28" height="10" rx="2" fill="url(#dockGradient)"/>
                <rect class="project-box box-1" x="6" y="12" width="6" height="6" rx="1" fill="url(#boxGradient1)"/>
                <rect class="project-box box-2" x="13" y="10" width="6" height="6" rx="1" fill="url(#boxGradient2)"/>
                <rect class="project-box box-3" x="20" y="14" width="6" height="6" rx="1" fill="url(#boxGradient3)"/>
                <rect x="4" y="24" width="2" height="6" fill="url(#dockGradient)"/>
                <rect x="12" y="24" width="2" height="6" fill="url(#dockGradient)"/>
                <rect x="20" y="24" width="2" height="6" fill="url(#dockGradient)"/>
                <rect x="26" y="24" width="2" height="6" fill="url(#dockGradient)"/>
                <defs>
                    <linearGradient id="dockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="boxGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#f093fb;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#f5576c;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="boxGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#00f2fe;stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="boxGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#43e97b;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#38f9d7;stop-opacity:1" />
                    </linearGradient>
                </defs>
            </svg>
        `;
    }
};

// Navigation Component
const NavigationComponent = {
    render: (currentPage = 'index.html') => {
        const pages = [
            { href: 'index.html', label: 'Home' },
            { href: 'projects.html', label: 'Projects' },
            { href: 'add-project.html', label: 'Add Project' },
            { href: 'categories.html', label: 'Categories' },
            { href: 'dashboard.html', label: 'Dashboard' },
            { href: 'about.html', label: 'About' },
            { href: 'contact.html', label: 'Contact' }
        ];

        const navLinks = pages.map(page => {
            const isActive = page.href === currentPage || 
                           (currentPage === '' && page.href === 'index.html');
            return `<li><a href="${page.href}" class="nav-link ${isActive ? 'active' : ''}">${page.label}</a></li>`;
        }).join('');

        return `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <span class="nav-logo" id="nav-logo">
                            ${LogoComponent.render()}
                        </span>
                        <span class="nav-brand-text">ProjectDock</span>
                    </div>
                    <ul class="nav-menu">
                        ${navLinks}
                    </ul>
                    <button class="theme-toggle" aria-label="Toggle theme">
                        <span>🌙</span>
                    </button>
                    <button class="hamburger" aria-label="Toggle menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </nav>
        `;
    }
};

// Footer Component
const FooterComponent = {
    render: () => {
        return `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h4>ProjectDock</h4>
                            <p>Organize, showcase, and track your projects with ease. Build your professional portfolio today.</p>
                        </div>
                        <div class="footer-section">
                            <h4>Quick Links</h4>
                            <ul>
                                <li><a href="index.html">Home</a></li>
                                <li><a href="projects.html">Projects</a></li>
                                <li><a href="add-project.html">Add Project</a></li>
                                <li><a href="dashboard.html">Dashboard</a></li>
                            </ul>
                        </div>
                        <div class="footer-section">
                            <h4>Resources</h4>
                            <ul>
                                <li><a href="categories.html">Categories</a></li>
                                <li><a href="about.html">About</a></li>
                                <li><a href="contact.html">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <div class="footer-bottom">
                        <p>&copy; 2024 ProjectDock. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        `;
    }
};

// Initialize Components
const Components = {
    init: () => {
        // Get current page
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Inject Navigation
        const navPlaceholder = document.getElementById('nav-placeholder');
        if (navPlaceholder) {
            navPlaceholder.outerHTML = NavigationComponent.render(currentPage);
        } else {
            // Fallback: find existing nav and replace
            const existingNav = document.querySelector('.navbar');
            if (existingNav) {
                existingNav.outerHTML = NavigationComponent.render(currentPage);
            }
        }

        // Inject Footer
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            footerPlaceholder.outerHTML = FooterComponent.render();
        } else {
            // Fallback: find existing footer and replace
            const existingFooter = document.querySelector('.footer');
            if (existingFooter) {
                existingFooter.outerHTML = FooterComponent.render();
            }
        }

        // Re-initialize navigation functionality after injection
        if (window.ProjectDock && window.ProjectDock.Navigation) {
            window.ProjectDock.Navigation.init();
            window.ProjectDock.Navigation.setupMobileMenu();
            window.ProjectDock.Navigation.setupScrollNavbar();
        }
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Components.init);
} else {
    Components.init();
}

// Export for manual initialization if needed
window.ProjectDockComponents = Components;

