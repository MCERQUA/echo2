/* Module 1.3 JavaScript - Basic Business Plan */

// Initialize Module 1.3 functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeProgressTracking();
    initializeChecklistFunctionality();
    initializeContentInteractivity();
    loadUserProgress();
    
    // Auto-save progress every 30 seconds
    setInterval(saveProgress, 30000);
});

// Progress tracking for Module 1.3
function initializeProgressTracking() {
    const moduleId = 'module-1-3';
    const progressKey = `${moduleId}_progress`;
    
    // Load saved progress
    const savedProgress = localStorage.getItem(progressKey);
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        updateProgressDisplay(progress);
    }
    
    // Track scroll progress
    let maxScroll = 0;
    window.addEventListener('scroll', function() {
        const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        maxScroll = Math.max(maxScroll, scrollPercent);
        
        // Update progress bar
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            const baseProgress = 18.75; // Module 3 of 16 = 18.75%
            const scrollProgress = (maxScroll / 100) * 6.25; // Additional progress within module
            progressBar.style.width = `${Math.min(baseProgress + scrollProgress, 25)}%`;
        }
        
        // Save progress if significant
        if (maxScroll > 25 && maxScroll % 25 === 0) {
            saveProgress();
        }
    });
}

// Checklist functionality with persistence
function initializeChecklistFunctionality() {
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const checklistKey = 'module-1-3_checklist';
    
    // Load saved checklist state
    const savedChecklist = localStorage.getItem(checklistKey);
    if (savedChecklist) {
        const checklistState = JSON.parse(savedChecklist);
        checkboxes.forEach((checkbox, index) => {
            if (checklistState[checkbox.id] || checklistState[index]) {
                checkbox.checked = true;
                updateCheckboxAppearance(checkbox);
            }
        });
    }
    
    // Add event listeners for checkbox changes
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            updateCheckboxAppearance(this);
            saveChecklistProgress();
            
            // Check if all items are completed
            const completedItems = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
            const totalItems = checkboxes.length;
            
            if (completedItems === totalItems) {
                showCompletionMessage();
            }
            
            // Update overall progress
            updateModuleProgress();
        });
    });
}

// Update checkbox visual appearance
function updateCheckboxAppearance(checkbox) {
    const label = checkbox.closest('.checklist-item');
    if (checkbox.checked) {
        label.style.background = '#f0f8ff';
        label.style.borderColor = '#27ae60';
        label.querySelector('.checkmark').style.textDecoration = 'line-through';
        label.querySelector('.checkmark').style.opacity = '0.7';
    } else {
        label.style.background = 'white';
        label.style.borderColor = '#e9ecef';
        label.querySelector('.checkmark').style.textDecoration = 'none';
        label.querySelector('.checkmark').style.opacity = '1';
    }
}

// Save checklist progress
function saveChecklistProgress() {
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const checklistState = {};
    
    checkboxes.forEach(checkbox => {
        checklistState[checkbox.id] = checkbox.checked;
    });
    
    localStorage.setItem('module-1-3_checklist', JSON.stringify(checklistState));
}

// Content interactivity features
function initializeContentInteractivity() {
    // Add hover effects to plan sections
    const planSections = document.querySelectorAll('.plan-section');
    planSections.forEach(section => {
        section.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
        });
        
        section.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        });
    });
    
    // Add click-to-expand functionality for insider tips
    const insiderTips = document.querySelectorAll('.insider-tip');
    insiderTips.forEach(tip => {
        tip.style.cursor = 'pointer';
        tip.addEventListener('click', function() {
            const content = this.querySelector('p');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                this.style.background = '#e8f6f3';
            } else {
                content.style.display = 'none';
                this.style.background = '#f8f9fa';
            }
        });
    });
    
    // Tool callout button interactions
    const toolButtons = document.querySelectorAll('.tool-callout .btn');
    toolButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
            this.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });
    });
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Show completion message when all checklist items are done
function showCompletionMessage() {
    // Create completion notification
    const notification = document.createElement('div');
    notification.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3);
            z-index: 1000;
            animation: slideIn 0.5s ease-out;
        ">
            <strong>🎉 Excellent Work!</strong><br>
            You've completed all action items for Module 1.3!
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.remove();
        style.remove();
    }, 5000);
    
    // Mark module as completed
    markModuleCompleted();
}

// Update overall module progress
function updateModuleProgress() {
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const completedItems = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
    const totalItems = checkboxes.length;
    const completionPercentage = (completedItems / totalItems) * 100;
    
    // Update progress in localStorage
    const progressData = {
        moduleId: 'module-1-3',
        completionPercentage: completionPercentage,
        completedItems: completedItems,
        totalItems: totalItems,
        lastUpdate: new Date().toISOString(),
        isCompleted: completionPercentage === 100
    };
    
    localStorage.setItem('module-1-3_progress', JSON.stringify(progressData));
    
    // Update global course progress
    updateCourseProgress();
}

// Load user progress from previous session
function loadUserProgress() {
    const progressKey = 'module-1-3_progress';
    const savedProgress = localStorage.getItem(progressKey);
    
    if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        
        // Show welcome back message if returning user
        if (progress.completionPercentage > 0) {
            showWelcomeBackMessage(progress);
        }
    }
}

// Show welcome back message for returning users
function showWelcomeBackMessage(progress) {
    const welcomeMessage = document.createElement('div');
    welcomeMessage.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
            color: white;
            padding: 1rem;
            margin: 1rem 0;
            border-radius: 8px;
            text-align: center;
        ">
            <strong>Welcome back!</strong> You're ${Math.round(progress.completionPercentage)}% complete with this module.
            <br><small>Last visit: ${new Date(progress.lastUpdate).toLocaleDateString()}</small>
        </div>
    `;
    
    const lessonHeader = document.querySelector('.lesson-header');
    if (lessonHeader) {
        lessonHeader.appendChild(welcomeMessage);
    }
}

// Mark module as completed
function markModuleCompleted() {
    const completionData = {
        moduleId: 'module-1-3',
        completedAt: new Date().toISOString(),
        timeSpent: calculateTimeSpent(),
        isCompleted: true
    };
    
    localStorage.setItem('module-1-3_completion', JSON.stringify(completionData));
    
    // Update course-wide progress
    updateCourseProgress();
    
    // Enable next module
    enableNextModule();
}

// Calculate time spent in module
function calculateTimeSpent() {
    const startTime = localStorage.getItem('module-1-3_startTime');
    if (startTime) {
        const timeSpent = Date.now() - parseInt(startTime);
        return Math.round(timeSpent / 1000 / 60); // minutes
    }
    return 0;
}

// Save general progress
function saveProgress() {
    const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked');
    
    const progressData = {
        scrollProgress: scrollPercent,
        checklistProgress: (checkboxes.length / document.querySelectorAll('.checklist-item input[type="checkbox"]').length) * 100,
        lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('module-1-3_session', JSON.stringify(progressData));
}

// Update course-wide progress
function updateCourseProgress() {
    let courseProgress = JSON.parse(localStorage.getItem('course_progress') || '{}');
    
    // Update Module 1.3 status
    courseProgress['module-1-3'] = {
        started: true,
        completed: document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length === 
                  document.querySelectorAll('.checklist-item input[type="checkbox"]').length,
        lastAccessed: new Date().toISOString()
    };
    
    // Calculate overall course completion
    const totalModules = 16;
    const completedModules = Object.values(courseProgress).filter(module => module.completed).length;
    courseProgress.overallCompletion = (completedModules / totalModules) * 100;
    
    localStorage.setItem('course_progress', JSON.stringify(courseProgress));
}

// Enable next module when this one is completed
function enableNextModule() {
    // Update navigation to show Module 1.4 as available
    const nextModuleLink = document.querySelector('a[href="../module-1-4/index.html"]');
    if (nextModuleLink) {
        nextModuleLink.style.opacity = '1';
        nextModuleLink.style.pointerEvents = 'auto';
        
        // Add completion badge
        const badge = document.createElement('span');
        badge.innerHTML = '✅';
        badge.style.marginLeft = '0.5rem';
        nextModuleLink.appendChild(badge);
    }
}

// Initialize module start tracking
if (!localStorage.getItem('module-1-3_startTime')) {
    localStorage.setItem('module-1-3_startTime', Date.now().toString());
}

// Add print functionality for business plan
function addPrintFunctionality() {
    const printButton = document.createElement('button');
    printButton.innerHTML = '🖨️ Print Module Summary';
    printButton.className = 'btn btn-secondary';
    printButton.style.margin = '1rem 0';
    
    printButton.addEventListener('click', function() {
        window.print();
    });
    
    const summarySection = document.querySelector('.summary-grid');
    if (summarySection) {
        summarySection.appendChild(printButton);
    }
}

// Add business plan export functionality
function addExportFunctionality() {
    const exportButton = document.createElement('button');
    exportButton.innerHTML = '📄 Export Progress Report';
    exportButton.className = 'btn btn-primary';
    exportButton.style.margin = '1rem 0';
    
    exportButton.addEventListener('click', function() {
        const progressData = generateProgressReport();
        downloadProgressReport(progressData);
    });
    
    const completionSection = document.querySelector('.completion-status');
    if (completionSection) {
        completionSection.appendChild(exportButton);
    }
}

// Generate progress report
function generateProgressReport() {
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    const completedItems = Array.from(checkboxes).filter(cb => cb.checked);
    
    const report = {
        moduleTitle: 'Module 1.3: Basic Business Plan',
        completionDate: new Date().toISOString(),
        progress: {
            completed: completedItems.length,
            total: checkboxes.length,
            percentage: Math.round((completedItems.length / checkboxes.length) * 100)
        },
        completedActions: completedItems.map(cb => 
            cb.nextElementSibling.textContent.trim()
        ),
        nextSteps: [
            'Complete Module 1.4: Getting Your First Customers',
            'Implement your business plan',
            'Track actual vs projected performance',
            'Adjust plan based on early results'
        ]
    };
    
    return report;
}

// Download progress report as text file
function downloadProgressReport(reportData) {
    const reportText = `
BLUE COLLAR BUSINESS SCHOOL
Module 1.3: Basic Business Plan - Progress Report
Generated: ${new Date(reportData.completionDate).toLocaleDateString()}

COMPLETION STATUS:
${reportData.progress.completed}/${reportData.progress.total} action items completed (${reportData.progress.percentage}%)

COMPLETED ACTION ITEMS:
${reportData.completedActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

NEXT STEPS:
${reportData.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

---
Blue Collar Business School - Practical business education for contractors
`;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Module-1-3-Progress-Report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Initialize additional functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        addPrintFunctionality();
        addExportFunctionality();
    }, 1000);
});

// Error handling for localStorage
function safeLocalStorageOperation(operation, key, value = null) {
    try {
        if (operation === 'get') {
            return localStorage.getItem(key);
        } else if (operation === 'set') {
            localStorage.setItem(key, value);
        } else if (operation === 'remove') {
            localStorage.removeItem(key);
        }
    } catch (error) {
        console.warn('LocalStorage operation failed:', error);
        // Fallback to sessionStorage or memory storage
        return null;
    }
}

// Module cleanup on page unload
window.addEventListener('beforeunload', function() {
    saveProgress();
    saveChecklistProgress();
});