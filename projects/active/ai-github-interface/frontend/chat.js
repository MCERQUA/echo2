// AI Message Server - Enhanced Chat Interface with Session Threading
let isConnected = false;
let sessionId = null;
let messageCount = 0;
let hasLoadedProjects = false;

// Expose sessionId globally for terminal.js
window.sessionId = null;

// Initialize conversation with session
window.addEventListener('DOMContentLoaded', async () => {
    await initializeSession();
    await checkConnection();
    
    // Automatically send project status request on first load
    if (isConnected && !hasLoadedProjects) {
        setTimeout(() => {
            sendProjectStatusRequest();
        }, 1000);
    }
});

async function initializeSession() {
    try {
        // Check if there's an existing session in localStorage
        const savedSessionId = localStorage.getItem('echo-session-id');
        const savedTimestamp = localStorage.getItem('echo-session-timestamp');
        
        // Check if saved session is less than 24 hours old
        if (savedSessionId && savedTimestamp) {
            const age = Date.now() - parseInt(savedTimestamp);
            if (age < 24 * 60 * 60 * 1000) { // 24 hours in milliseconds
                // Verify session still exists on server
                const response = await fetch(`/api/session/${savedSessionId}`);
                if (response.ok) {
                    sessionId = savedSessionId;
                    window.sessionId = sessionId; // Expose globally
                    const data = await response.json();
                    messageCount = data.messageCount || 0;
                    console.log(`Resumed session ${sessionId} with ${messageCount} messages`);
                    
                    // Update UI to show session info
                    updateSessionInfo();
                    return;
                }
            }
        }
        
        // Create new session
        const response = await fetch('/api/session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            sessionId = data.sessionId;
            window.sessionId = sessionId; // Expose globally
            
            // Save to localStorage
            localStorage.setItem('echo-session-id', sessionId);
            localStorage.setItem('echo-session-timestamp', Date.now().toString());
            
            console.log(`Created new session: ${sessionId}`);
            updateSessionInfo();
        }
    } catch (error) {
        console.error('Failed to initialize session:', error);
        // Continue without session (ephemeral mode)
        sessionId = null;
        window.sessionId = null;
    }
}

function updateSessionInfo() {
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl && sessionId) {
        const sessionInfo = document.createElement('div');
        sessionInfo.className = 'session-info';
        sessionInfo.innerHTML = `
            <span style="font-size: 0.75rem; color: var(--primary-400); margin-top: 0.25rem;">
                Session: ${sessionId.substring(0, 8)}... 
                <button onclick="clearSession()" style="margin-left: 0.5rem; color: var(--accent-500); cursor: pointer;">Clear</button>
            </span>
        `;
        
        // Remove existing session info if any
        const existing = statusEl.querySelector('.session-info');
        if (existing) existing.remove();
        
        statusEl.appendChild(sessionInfo);
    }
}

async function clearSession() {
    if (!sessionId) return;
    
    if (confirm('Clear conversation history? This will start a new session.')) {
        try {
            await fetch(`/api/session/${sessionId}`, {
                method: 'DELETE'
            });
            
            // Clear localStorage
            localStorage.removeItem('echo-session-id');
            localStorage.removeItem('echo-session-timestamp');
            
            // Clear chat UI
            const messagesEl = document.getElementById('chat-messages');
            messagesEl.innerHTML = '';
            
            // Initialize new session
            await initializeSession();
            
            // Show confirmation
            addMessage('Session cleared. Starting fresh conversation.', false);
        } catch (error) {
            console.error('Failed to clear session:', error);
        }
    }
}

async function sendProjectStatusRequest() {
    hasLoadedProjects = true;
    
    // Clear the initial message
    const messagesEl = document.getElementById('chat-messages');
    messagesEl.innerHTML = '';
    
    // Send the project status request
    await sendMessage("List my GitHub repositories", true);
}

async function checkConnection() {
    const statusEl = document.getElementById('connectionStatus');
    const statusIndicator = statusEl.querySelector('.status-indicator');
    const statusText = statusEl.querySelector('.status-text');
    
    try {
        const response = await fetch('/api/health');
        if (response.ok) {
            const data = await response.json();
            if (statusIndicator) {
                statusIndicator.style.background = '#10b981';
                statusIndicator.style.boxShadow = '0 0 10px #10b981';
            }
            if (statusText) {
                statusText.textContent = `Neural Link Active`;
            }
            isConnected = true;
            
            // Hide configuration notice
            const configNotice = document.getElementById('configNotice');
            if (configNotice) {
                configNotice.classList.add('hidden');
            }
            
            // Remove welcome message after successful connection
            setTimeout(() => {
                const welcomeMsg = document.querySelector('.welcome-message');
                if (welcomeMsg) {
                    welcomeMsg.style.opacity = '0';
                    setTimeout(() => welcomeMsg.remove(), 500);
                }
            }, 1000);
        } else {
            throw new Error('API not responding');
        }
    } catch (error) {
        if (statusIndicator) {
            statusIndicator.style.background = '#ef4444';
            statusIndicator.style.boxShadow = '0 0 10px #ef4444';
        }
        if (statusText) {
            statusText.textContent = 'Connection Lost';
        }
        isConnected = false;
        console.error('Connection error:', error);
        
        // Show configuration notice
        const configNotice = document.getElementById('configNotice');
        if (configNotice) {
            configNotice.classList.remove('hidden');
        }
    }
}

function addMessage(content, isUser = false, isThinking = false, usage = null) {
    const messagesEl = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'assistant'}`;
    
    if (isThinking) {
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-content-inner">
                    <div class="thinking-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        `;
        messageDiv.id = 'thinking-indicator';
    } else {
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const messageInner = document.createElement('div');
        messageInner.className = 'message-content-inner';
        
        // Handle formatting
        content = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>') // Code blocks
            .replace(/`([^`]+)`/g, '<code>$1</code>') // Inline code
            .replace(/\n/g, '<br>'); // Line breaks
        
        messageInner.innerHTML = content;
        
        // Add usage info if available
        if (usage && !isUser) {
            const usageDiv = document.createElement('div');
            usageDiv.className = 'usage-info';
            usageDiv.innerHTML = `
                <span>Tokens: ${usage.total_tokens || 0}</span>
                ${usage.estimated_cost ? `<span style="margin-left: 0.5rem;">Cost: ${usage.estimated_cost}</span>` : ''}
            `;
            messageInner.appendChild(usageDiv);
        }
        
        messageContent.appendChild(messageInner);
        messageDiv.appendChild(messageContent);
    }
    
    messagesEl.appendChild(messageDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    // Update message count
    if (!isThinking && !isUser) {
        messageCount++;
        const totalMsgs = document.getElementById('total-messages');
        if (totalMsgs) {
            totalMsgs.textContent = messageCount;
        }
    }
}

function showTyping() {
    addMessage('', false, true);
}

function hideTyping() {
    const typingIndicator = document.getElementById('thinking-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function sendMessage(message, isFirstMessage = false) {
    const input = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const text = message || input.value.trim();
    
    if (!text) return;
    
    // Disable input while processing
    if (input) input.disabled = true;
    if (sendButton) sendButton.disabled = true;
    
    // Clear input
    if (!message && input) {
        input.value = '';
        input.style.height = 'auto';
        const charCount = document.getElementById('char-current');
        if (charCount) charCount.textContent = '0';
    }
    
    // Add user message
    addMessage(text, true);
    
    // Show typing indicator
    showTyping();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: text,
                sessionId: sessionId // Include session ID for threading
            })
        });
        
        hideTyping();
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            addMessage(`Error: ${data.error}`);
        } else {
            // Add response with usage info
            addMessage(data.response || 'No response received', false, false, data.usage);
            
            // Update session ID if returned (in case of ephemeral -> persistent)
            if (data.sessionId && data.sessionId !== 'ephemeral' && !sessionId) {
                sessionId = data.sessionId;
                window.sessionId = sessionId; // Update global
                localStorage.setItem('echo-session-id', sessionId);
                localStorage.setItem('echo-session-timestamp', Date.now().toString());
                updateSessionInfo();
            }
        }
        
    } catch (error) {
        hideTyping();
        console.error('Error:', error);
        addMessage(`Sorry, there was an error: ${error.message}`);
    } finally {
        // Re-enable input
        if (input) {
            input.disabled = false;
            input.focus();
        }
        if (sendButton) sendButton.disabled = false;
    }
}

// Make functions available globally
window.sendMessage = sendMessage;
window.clearSession = clearSession;

// Keyboard shortcut for new session (Ctrl/Cmd + K)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearSession();
    }
});
