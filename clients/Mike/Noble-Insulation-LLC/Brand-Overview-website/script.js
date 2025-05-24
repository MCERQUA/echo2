// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(102, 126, 234, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.backdropFilter = 'none';
    }
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Animate progress bars when they come into view
            if (entry.target.classList.contains('progress-fill')) {
                const width = entry.target.style.width;
                entry.target.style.width = '0%';
                setTimeout(() => {
                    entry.target.style.width = width;
                }, 300);
            }
            
            // Animate chart bars
            if (entry.target.classList.contains('bar-fill')) {
                const height = entry.target.style.height;
                entry.target.style.height = '0%';
                setTimeout(() => {
                    entry.target.style.height = height;
                }, 500);
            }
            
            // Animate detail fills
            if (entry.target.classList.contains('detail-fill')) {
                const width = entry.target.style.width;
                entry.target.style.width = '0%';
                setTimeout(() => {
                    entry.target.style.width = width;
                }, 200);
            }
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    // Set initial states for animated elements
    const animatedElements = document.querySelectorAll('.summary-card, .audit-category, .timeline-phase, .investment-tier');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    // Observe progress bars and chart elements
    const progressBars = document.querySelectorAll('.progress-fill, .detail-fill, .bar-fill');
    progressBars.forEach(bar => {
        observer.observe(bar);
    });
});

// Hero stats counter animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number, .outcome-number');
    
    counters.forEach(counter => {
        const text = counter.textContent;
        const number = parseFloat(text.replace(/[^\d.-]/g, ''));
        
        if (!isNaN(number)) {
            let current = 0;
            const increment = number / 50;
            const timer = setInterval(() => {
                current += increment;
                if (current >= number) {
                    counter.textContent = text;
                    clearInterval(timer);
                } else {
                    const suffix = text.replace(/[\d.-]/g, '');
                    counter.textContent = Math.floor(current) + suffix;
                }
            }, 30);
        }
    });
}

// Trigger counter animation when hero is visible
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            setTimeout(animateCounters, 500);
            heroObserver.unobserve(entry.target);
        }
    });
});

const heroStats = document.querySelector('.hero-stats');
if (heroStats) {
    heroObserver.observe(heroStats);
}

// Parallax effect for hero background
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero-background');
    const speed = scrolled * 0.5;
    
    if (parallax) {
        parallax.style.transform = `translateY(${speed}px)`;
    }
});

// Dynamic navbar highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 200;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop && scrollY <= sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    });
});

// Add active state styling
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: white !important;
        background: rgba(255, 255, 255, 0.2) !important;
    }
`;
document.head.appendChild(style);

// Interactive hover effects for cards
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.summary-card, .audit-category, .timeline-phase, .investment-tier');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });
});

// Competitive table row interactions
document.addEventListener('DOMContentLoaded', () => {
    const tableRows = document.querySelectorAll('.table-row');
    
    tableRows.forEach(row => {
        row.addEventListener('mouseenter', () => {
            if (!row.classList.contains('noble-row')) {
                row.style.background = 'linear-gradient(135deg, #f7fafc, #edf2f7)';
            }
        });
        
        row.addEventListener('mouseleave', () => {
            if (!row.classList.contains('noble-row')) {
                row.style.background = 'white';
            }
        });
    });
});

// Investment tier selection effect
document.addEventListener('DOMContentLoaded', () => {
    const investmentTiers = document.querySelectorAll('.investment-tier');
    
    investmentTiers.forEach(tier => {
        tier.addEventListener('click', () => {
            // Remove previous selections
            investmentTiers.forEach(t => {
                t.classList.remove('selected');
                t.style.boxShadow = '';
            });
            
            // Add selection to clicked tier
            tier.classList.add('selected');
            tier.style.boxShadow = '0 15px 35px rgba(66, 153, 225, 0.3)';
            
            // Add pulse animation
            tier.style.animation = 'pulse 0.6s';
            setTimeout(() => {
                tier.style.animation = '';
            }, 600);
        });
    });
});

// Add pulse animation keyframes
const pulseStyle = document.createElement('style');
pulseStyle.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(pulseStyle);

// Performance optimization: Debounced scroll handler
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll handlers
const debouncedScrollHandler = debounce(() => {
    // Navbar background
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(102, 126, 234, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.backdropFilter = 'none';
    }
    
    // Parallax effect
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero-background');
    const speed = scrolled * 0.5;
    
    if (parallax) {
        parallax.style.transform = `translateY(${speed}px)`;
    }
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Loading animation for the page
document.addEventListener('DOMContentLoaded', () => {
    // Animate hero elements on load
    const heroTitle = document.querySelector('.hero-title');
    const heroDescription = document.querySelector('.hero-description');
    const heroStats = document.querySelector('.hero-stats');
    const ctaButton = document.querySelector('.cta-button');
    const analysisPreview = document.querySelector('.analysis-preview');
    
    // Set initial states
    [heroTitle, heroDescription, heroStats, ctaButton].forEach((el, index) => {
        if (el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.8s ease';
            
            // Stagger animations
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 300 + (index * 150));
        }
    });
    
    // Animate analysis preview separately
    if (analysisPreview) {
        analysisPreview.style.opacity = '0';
        analysisPreview.style.transform = 'translateX(50px)';
        analysisPreview.style.transition = 'all 1s ease';
        
        setTimeout(() => {
            analysisPreview.style.opacity = '1';
            analysisPreview.style.transform = 'translateX(0)';
        }, 800);
    }
});

// Add subtle mouse tracking effect to hero
document.addEventListener('mousemove', (e) => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;
    
    const analysisPreview = document.querySelector('.analysis-preview');
    if (analysisPreview) {
        const moveX = deltaX * 10;
        const moveY = deltaY * 10;
        
        analysisPreview.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
});

// Reset position when mouse leaves hero
document.querySelector('.hero')?.addEventListener('mouseleave', () => {
    const analysisPreview = document.querySelector('.analysis-preview');
    if (analysisPreview) {
        analysisPreview.style.transform = 'translate(0, 0)';
    }
});