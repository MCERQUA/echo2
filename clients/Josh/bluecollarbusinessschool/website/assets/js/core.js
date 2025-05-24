// Core JavaScript functionality for Blue Collar Business School

// Global state management
const BCBS = {
    // Course progress tracking
    progress: {
        loadProgress: function() {
            return JSON.parse(localStorage.getItem('course-progress') || '{}');
        },
        
        saveProgress: function(progress) {
            localStorage.setItem('course-progress', JSON.stringify(progress));
        },
        
        updateModuleProgress: function(stage, module, data) {
            const progress = this.loadProgress();
            if (!progress[stage]) progress[stage] = {};
            progress[stage][module] = {
                ...progress[stage][module],
                ...data,
                lastUpdated: new Date().toISOString()
            };
            this.saveProgress(progress);
        },
        
        getModuleProgress: function(stage, module) {
            const progress = this.loadProgress();
            return progress[stage] && progress[stage][module] || null;
        },
        
        getOverallProgress: function() {
            const progress = this.loadProgress();
            const stages = ['stage-1', 'stage-2', 'stage-3', 'stage-4'];
            const modulesPerStage = 4;
            
            let completedModules = 0;
            let totalModules = stages.length * modulesPerStage;
            
            stages.forEach(stage => {
                if (progress[stage]) {
                    Object.values(progress[stage]).forEach(module => {
                        if (module.completed) completedModules++;
                    });
                }
            });
            
            return {
                completed: completedModules,
                total: totalModules,
                percentage: Math.round((completedModules / totalModules) * 100)
            };
        }
    },
    
    // User data management
    user: {
        loadProfile: function() {
            return JSON.parse(localStorage.getItem('user-profile') || '{}');
        },
        
        saveProfile: function(profile) {
            localStorage.setItem('user-profile', JSON.stringify(profile));
        },
        
        updateProfile: function(updates) {
            const profile = this.loadProfile();
            const updated = { ...profile, ...updates, lastUpdated: new Date().toISOString() };
            this.saveProfile(updated);
        }
    },
    
    // Utility functions
    utils: {
        formatCurrency: function(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        },
        
        formatDate: function(dateString) {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        },
        
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },
        
        showNotification: function(message, type = 'info', duration = 5000) {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-message">${message}</span>
                    <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
                </div>
            `;
            
            // Add styles
            const styles = {
                info: { bg: '#3498db', color: '#fff' },
                success: { bg: '#27ae60', color: '#fff' },
                warning: { bg: '#f39c12', color: '#fff' },
                error: { bg: '#e74c3c', color: '#fff' }
            };
            
            const style = styles[type] || styles.info;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${style.bg};
                color: ${style.color};
                padding: 1rem 2rem;
                border-radius: 8px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                z-index: 1000;
                animation: slideIn 0.3s ease;
                max-width: 400px;
            `;
            
            document.body.appendChild(notification);
            
            // Auto remove
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOut 0.3s ease';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        },
        
        validateEmail: function(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        
        validatePhone: function(phone) {
            return /^[\+]?[1-9][\d]{0,49}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
        },
        
        generateId: function() {
            return Math.random().toString(36).substr(2, 9);
        }
    },
    
    // Analytics and tracking
    analytics: {
        trackPageView: function(page) {
            const event = {
                type: 'page_view',
                page: page,
                timestamp: new Date().toISOString(),
                user: BCBS.user.loadProfile().id || 'anonymous'
            };
            this.logEvent(event);
        },
        
        trackModuleCompletion: function(stage, module) {
            const event = {
                type: 'module_completion',
                stage: stage,
                module: module,
                timestamp: new Date().toISOString(),
                user: BCBS.user.loadProfile().id || 'anonymous'
            };
            this.logEvent(event);
        },
        
        trackToolUsage: function(tool, data = {}) {
            const event = {
                type: 'tool_usage',
                tool: tool,
                data: data,
                timestamp: new Date().toISOString(),
                user: BCBS.user.loadProfile().id || 'anonymous'
            };
            this.logEvent(event);
        },
        
        logEvent: function(event) {
            // Store events locally
            const events = JSON.parse(localStorage.getItem('analytics-events') || '[]');
            events.push(event);
            
            // Keep only last 100 events
            if (events.length > 100) {
                events.splice(0, events.length - 100);
            }
            
            localStorage.setItem('analytics-events', JSON.stringify(events));
        },
        
        getEvents: function(type = null) {
            const events = JSON.parse(localStorage.getItem('analytics-events') || '[]');
            return type ? events.filter(e => e.type === type) : events;
        }
    }
};

// Global initialization
function initializeApp() {
    // Track page view
    BCBS.analytics.trackPageView(window.location.pathname);
    
    // Initialize user if not exists
    const profile = BCBS.user.loadProfile();
    if (!profile.id) {
        BCBS.user.updateProfile({
            id: BCBS.utils.generateId(),
            createdAt: new Date().toISOString(),
            lastVisit: new Date().toISOString()
        });
    } else {
        BCBS.user.updateProfile({
            lastVisit: new Date().toISOString()
        });
    }
    
    // Update progress displays
    updateProgressDisplays();
    
    // Setup global event listeners
    setupGlobalEventListeners();
    
    // Add CSS animations
    addGlobalStyles();
}

// Update progress displays throughout the site
function updateProgressDisplays() {
    const overallProgress = BCBS.progress.getOverallProgress();
    
    // Update overall progress bars
    document.querySelectorAll('.overall-progress-bar').forEach(bar => {
        const fill = bar.querySelector('.progress-fill');
        if (fill) {
            fill.style.width = `${overallProgress.percentage}%`;
        }
    });
    
    // Update progress text
    document.querySelectorAll('.overall-progress-text').forEach(text => {
        text.textContent = `${overallProgress.completed} of ${overallProgress.total} modules completed`;
    });
    
    // Update module completion status
    document.querySelectorAll('[data-module]').forEach(element => {
        const stage = element.dataset.stage;
        const module = element.dataset.module;
        const progress = BCBS.progress.getModuleProgress(stage, module);
        
        if (progress && progress.completed) {
            element.classList.add('completed');
        }
    });
}

// Setup global event listeners
function setupGlobalEventListeners() {
    // Form submission tracking
    document.addEventListener('submit', function(e) {
        const form = e.target;
        if (form.dataset.track) {
            BCBS.analytics.trackToolUsage(form.dataset.track, {
                action: 'form_submit',
                formId: form.id
            });
        }
    });
    
    // Button click tracking
    document.addEventListener('click', function(e) {
        const button = e.target.closest('button, .btn');
        if (button && button.dataset.track) {
            BCBS.analytics.trackToolUsage(button.dataset.track, {
                action: 'button_click',
                buttonText: button.textContent.trim()
            });
        }
    });
    
    // External link tracking
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link && link.href && !link.href.includes(window.location.hostname)) {
            BCBS.analytics.trackToolUsage('external_link', {
                url: link.href,
                text: link.textContent.trim()
            });
        }
    });
    
    // Scroll tracking for engagement
    let maxScroll = 0;
    const trackScroll = BCBS.utils.debounce(() => {
        const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            if (maxScroll >= 25 && maxScroll < 50) {
                BCBS.analytics.trackToolUsage('scroll_engagement', { depth: '25%' });
            } else if (maxScroll >= 50 && maxScroll < 75) {
                BCBS.analytics.trackToolUsage('scroll_engagement', { depth: '50%' });
            } else if (maxScroll >= 75) {
                BCBS.analytics.trackToolUsage('scroll_engagement', { depth: '75%' });
            }
        }
    }, 1000);
    
    window.addEventListener('scroll', trackScroll);
}

// Add global CSS animations and styles
function addGlobalStyles() {
    const styles = `
        <style>
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .fade-in {
            animation: fadeIn 0.6s ease;
        }
        
        .notification {
            animation: slideIn 0.3s ease;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: inherit;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            opacity: 0.7;
            transition: opacity 0.3s ease;
        }
        
        .notification-close:hover {
            opacity: 1;
        }
        
        .completed::after {
            content: '✓';
            color: #27ae60;
            font-weight: bold;
            margin-left: 0.5rem;
        }
        
        .loading {
            opacity: 0.6;
            pointer-events: none;
        }
        
        .loading::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 20px;
            height: 20px;
            margin: -10px 0 0 -10px;
            border: 2px solid #f3f3f3;
            border-top: 2px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
            .notification {
                left: 10px;
                right: 10px;
                top: 10px;
                max-width: none;
            }
        }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Form validation helpers
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            showFieldError(field, 'This field is required');
            isValid = false;
        } else if (field.type === 'email' && !BCBS.utils.validateEmail(field.value)) {
            showFieldError(field, 'Please enter a valid email address');
            isValid = false;
        } else if (field.type === 'tel' && !BCBS.utils.validatePhone(field.value)) {
            showFieldError(field, 'Please enter a valid phone number');
            isValid = false;
        } else {
            clearFieldError(field);
        }
    });
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    const error = document.createElement('div');
    error.className = 'field-error';
    error.textContent = message;
    error.style.cssText = 'color: #e74c3c; font-size: 0.8rem; margin-top: 0.25rem;';
    
    field.style.borderColor = '#e74c3c';
    field.parentNode.insertBefore(error, field.nextSibling);
}

function clearFieldError(field) {
    const error = field.parentNode.querySelector('.field-error');
    if (error) {
        error.remove();
    }
    field.style.borderColor = '';
}

// Save/load form data helpers
function saveFormData(formId, data) {
    localStorage.setItem(`form-data-${formId}`, JSON.stringify(data));
}

function loadFormData(formId) {
    const saved = localStorage.getItem(`form-data-${formId}`);
    return saved ? JSON.parse(saved) : null;
}

function autoSaveForm(form) {
    const formId = form.id || BCBS.utils.generateId();
    if (!form.id) form.id = formId;
    
    const saveData = BCBS.utils.debounce(() => {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        saveFormData(formId, data);
    }, 1000);
    
    form.addEventListener('input', saveData);
    form.addEventListener('change', saveData);
    
    // Load saved data
    const savedData = loadFormData(formId);
    if (savedData) {
        Object.entries(savedData).forEach(([key, value]) => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = value;
            }
        });
    }
}

// Module completion helpers
function markModuleComplete(stage, module, score = 100) {
    BCBS.progress.updateModuleProgress(stage, module, {
        completed: true,
        completionDate: new Date().toISOString(),
        score: score
    });
    
    BCBS.analytics.trackModuleCompletion(stage, module);
    updateProgressDisplays();
    
    BCBS.utils.showNotification(
        `Module ${module} completed successfully!`,
        'success'
    );
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    BCBS.analytics.trackToolUsage('error', {
        message: e.message,
        filename: e.filename,
        lineno: e.lineno
    });
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export for global use
window.BCBS = BCBS;