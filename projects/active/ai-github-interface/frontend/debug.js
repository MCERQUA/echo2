// Debug helper for Echo AI Terminal
// Add this temporarily to help diagnose issues

console.log('[Echo Debug] Starting diagnostic...');

// Check if scripts are loading
console.log('[Echo Debug] Scripts loaded:', {
    'chat.js': typeof initializeSession !== 'undefined',
    'terminal.js': typeof sendMessage !== 'undefined',
    'sessionId': window.sessionId
});

// Override fetch to log API calls
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    console.log('[Echo Debug] API Call:', args[0], args[1]);
    try {
        const response = await originalFetch(...args);
        console.log('[Echo Debug] API Response:', response.status, response.statusText);
        return response;
    } catch (error) {
        console.error('[Echo Debug] API Error:', error);
        throw error;
    }
};

// Check mobile detection
function checkMobile() {
    const isMobile = window.innerWidth <= 768;
    console.log('[Echo Debug] Mobile detected:', isMobile, 'Width:', window.innerWidth);
    
    // Check if mobile styles are applied
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        const sidebarDisplay = window.getComputedStyle(sidebar).display;
        console.log('[Echo Debug] Sidebar display:', sidebarDisplay, '(should be "none" on mobile)');
    }
}

// Run checks when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    console.log('[Echo Debug] DOM Ready');
    checkMobile();
    
    // Check for critical elements
    const elements = {
        'chat-messages': document.getElementById('chat-messages'),
        'message-input': document.getElementById('message-input'),
        'send-button': document.getElementById('send-button'),
        'connectionStatus': document.getElementById('connectionStatus'),
        'conversation-id': document.getElementById('conversation-id')
    };
    
    Object.entries(elements).forEach(([id, element]) => {
        console.log(`[Echo Debug] Element #${id}:`, element ? 'Found' : 'MISSING');
    });
    
    // Monitor session initialization
    setTimeout(() => {
        console.log('[Echo Debug] Session status after 1s:', {
            sessionId: window.sessionId,
            localStorage: {
                'echo-session-id': localStorage.getItem('echo-session-id'),
                'echo-session-timestamp': localStorage.getItem('echo-session-timestamp')
            }
        });
    }, 1000);
});

// Monitor window resize for mobile testing
window.addEventListener('resize', () => {
    console.log('[Echo Debug] Window resized to:', window.innerWidth, 'x', window.innerHeight);
    checkMobile();
});
