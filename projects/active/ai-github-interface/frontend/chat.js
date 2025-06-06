// AI Message Server - Enhanced Chat Interface with Session Threading
let isConnected = false;
let sessionId = null;
let messageCount = 0;
let hasLoadedProjects = false;

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
    }
}

function updateSessionInfo() {
    const statusEl = document.getElementById('connectionStatus');
    if (statusEl && sessionId) {
        const sessionInfo = document.createElement('div');
        sessionInfo.className = 'text-xs text-gray-400 mt-1';
        sessionInfo.innerHTML = `
            Session: ${sessionId.substring(0, 8)}... 
            <button onclick="clearSession()" class="ml-2 text-red-400 hover:text-red-300">Clear</button>
        `;
        
        // Remove existing session info if any
        const existing = statusEl.querySelector('.text-xs');
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
    const statusDot = statusEl.querySelector('.status-dot');
    const statusText = statusEl.querySelector('.status-text');
    
    try {
        const response = await fetch('/api/health');
        if (response.ok) {
            const data = await response.json();
            statusDot.className = 'status-dot connected';
            statusText.textContent = `Connected (${data.model})`;
            isConnected = true;
            
            // Show features if session threading is supported
            if (data.features && data.features.includes('session_threading')) {
                statusText.textContent += ' + Threading';
            }
            
            // Hide configuration notice
            const configNotice = document.getElementById('configNotice');
            if (configNotice) {
                configNotice.style.display = 'none';
            }
        } else {
            throw new Error('API not responding');
        }
    } catch (error) {
        statusDot.className = 'status-dot disconnected';
        statusText.textContent = 'Disconnected';
        console.error('Connection error:', error);
        
        // Show configuration notice
        const configNotice = document.getElementById('configNotice');
        if (configNotice) {
            configNotice.style.display = 'block';
        }
    }
}

function addMessage(content, isUser = false, isThinking = false, usage = null) {
    const messagesEl = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message mb-4 ${isUser ? 'text-right' : 'text-left'}`;
    
    const bubble = document.createElement('div');
    bubble.className = `inline-block px-4 py-2 rounded-lg max-w-xs md:max-w-md ${
        isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
    }`;
    
    if (isThinking) {
        bubble.innerHTML = `
            <div class="flex space-x-1">
                <span class="thinking-indicator"></span>
                <span class="thinking-indicator"></span>
                <span class="thinking-indicator"></span>
            </div>
        `;
        messageDiv.id = 'thinking-indicator';
    } else {
        // Handle formatting
        content = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
            .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 p-2 rounded mt-2 overflow-x-auto"><code>$1</code></pre>') // Code blocks
            .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1 rounded">$1</code>') // Inline code
            .replace(/\n/g, '<br>'); // Line breaks
        
        bubble.innerHTML = content;
        
        // Add usage info if available
        if (usage && !isUser) {
            const usageDiv = document.createElement('div');
            usageDiv.className = 'text-xs text-gray-400 mt-2 pt-2 border-t border-gray-600';
            usageDiv.innerHTML = `
                <span>Tokens: ${usage.total_tokens || 0}</span>
                ${usage.estimated_cost ? `<span class="ml-2">Cost: ${usage.estimated_cost}</span>` : ''}
            `;
            bubble.appendChild(usageDiv);
        }
    }
    
    messageDiv.appendChild(bubble);
    messagesEl.appendChild(messageDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
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
    input.disabled = true;
    sendButton.disabled = true;
    
    // Clear input
    if (!message) {
        input.value = '';
    }
    
    // Add user message
    addMessage(text, true);
    messageCount++;
    
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
        input.disabled = false;
        sendButton.disabled = false;
        input.focus();
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
