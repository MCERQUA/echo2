// Dashboard Authentication Script
// This script handles session management for the dashboard

// Initialize Supabase
const SUPABASE_URL = 'https://orhswpgngjpztcxgwbuy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yaHN3cGduZ2pwenRjeGd3YnV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI5MDM0NjIsImV4cCI6MjA0ODQ3OTQ2Mn0.vTt4L2h7B6U-2OYzfbYhcFRZUdPU9LM5SA7AHZHFxts';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth state management
let isCheckingAuth = true;

// Check authentication status
async function checkAuth() {
    console.log('Checking authentication status...');
    
    try {
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Session error:', error);
            redirectToLogin();
            return;
        }
        
        if (!session) {
            console.log('No active session found');
            redirectToLogin();
            return;
        }
        
        // Session exists - user is authenticated
        console.log('User authenticated:', session.user.email);
        isCheckingAuth = false;
        
        // Update UI with user info
        const userEmail = document.getElementById('user-email');
        if (userEmail) {
            userEmail.textContent = session.user.email;
        }
        
        // Show dashboard content
        const dashboardContent = document.getElementById('dashboard-content');
        if (dashboardContent) {
            dashboardContent.style.display = 'block';
        }
        
        // Hide loading state
        const loadingState = document.getElementById('loading-state');
        if (loadingState) {
            loadingState.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Unexpected error:', error);
        redirectToLogin();
    }
}

// Redirect to login page
function redirectToLogin() {
    if (!isCheckingAuth) return;
    
    console.log('Redirecting to login...');
    // Add a small delay to prevent redirect loops
    setTimeout(() => {
        window.location.href = '/login.html';
    }, 100);
}

// Handle logout
async function handleLogout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Logout error:', error);
        }
        window.location.href = '/login.html';
    } catch (error) {
        console.error('Logout error:', error);
        window.location.href = '/login.html';
    }
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event);
    
    if (event === 'SIGNED_OUT') {
        redirectToLogin();
    } else if (event === 'SIGNED_IN' && session) {
        // Refresh the page to load dashboard content
        if (window.location.pathname.includes('dashboard')) {
            isCheckingAuth = false;
        }
    }
});

// Initialize auth check when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only check auth on dashboard pages
    if (window.location.pathname.includes('dashboard')) {
        checkAuth();
    }
});

// Export functions for use in other scripts
window.dashboardAuth = {
    checkAuth,
    handleLogout,
    supabase
};