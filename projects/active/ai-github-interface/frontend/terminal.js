// Echo AI Communication Terminal - Enhanced JavaScript
let isConnected = false;
let conversationId = null;
let messageCount = 0;
let hasLoadedProjects = false;
let conversationHistory = [];
let taskCount = 0;

// Generate unique conversation ID
function generateConversationId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `conv-${timestamp}-${random}`;
}

// Initialize terminal
window.addEventListener('DOMContentLoaded', async () => {
    conversationId = generateConversationId();
    
    // Update session ID in status bar
    document.getElementById('conversation-id').textContent = `Session: ${conversationId.slice(0, 16)}...`;
    
    // Initialize components
    await checkConnection();
    loadProjects();
    setupInputHandlers();
    
    // Auto-load project status after connection
    if (isConnected && !hasLoadedProjects) {
        setTimeout(() => {
            sendProjectStatusRequest();
        }, 1500);
    }
    
    // Start latency monitoring
    monitorLatency();
});

// Connection check with visual feedback
async function checkConnection() {
    const statusEl = document.getElementById('connectionStatus');
    const statusIndicator = statusEl.querySelector('.status-indicator');
    const statusText = statusEl.querySelector('.status-text');
    
    try {
        const startTime = Date.now();
        const response = await fetch('/api/health');
        const latency = Date.now() - startTime;
        
        if (response.ok) {
            const data = await response.json();
            statusIndicator.style.background = '#10b981';
            statusIndicator.style.boxShadow = '0 0 10px #10b981';
            statusText.textContent = 'Neural Link Active';
            isConnected = true;
            
            // Update latency
            document.getElementById('connection-ping').textContent = `Latency: ${latency}ms`;
            
            // Hide config notice
            document.getElementById('configNotice').classList.add('hidden');
            
            showNotification('Connection established', 'success');
        } else {
            throw new Error('API not responding');
        }
    } catch (error) {
        statusIndicator.style.background = '#ef4444';
        statusIndicator.style.boxShadow = '0 0 10px #ef4444';
        statusText.textContent = 'Connection Lost';
        isConnected = false;
        
        document.getElementById('configNotice').classList.remove('hidden');
        showNotification('Connection failed', 'error');
    }
}

// Load projects into sidebar
async function loadProjects() {
    const projectList = document.getElementById('project-list');
    
    try {
        const response = await fetch('/api/projects');
        if (response.ok) {
            const data = await response.json();
            
            projectList.innerHTML = '';
            
            // Update counter
            const counterNumber = document.querySelector('.counter-number');
            counterNumber.textContent = data.projects.length;
            
            // Add project items
            data.projects.forEach((project, index) => {
                const projectEl = document.createElement('div');
                projectEl.className = 'project-item';
                projectEl.style.animationDelay = `${index * 0.05}s`;
                
                const statusColor = project.status === 'active' ? '#10b981' : 
                                  project.status === 'planned' ? '#f59e0b' : '#6e7681';
                
                projectEl.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <h3 style="font-weight: 600; font-size: 0.95rem;">${project.name}</h3>
                        <span style="width: 8px; height: 8px; background: ${statusColor}; border-radius: 50%; flex-shrink: 0; margin-top: 4px;"></span>
                    </div>
                    <p style="font-size: 0.8rem; color: var(--primary-300); line-height: 1.4;">${project.description}</p>
                    <div style="margin-top: 0.5rem; font-size: 0.75rem; color: var(--primary-400);">
                        ${project.category} • ${project.status}
                    </div>
                `;
                
                projectEl.addEventListener('click', () => {
                    sendMessage(`Tell me more about the ${project.name} project`);
                });
                
                projectList.appendChild(projectEl);
            });
        }
    } catch (error) {
        console.error('Failed to load projects:', error);
        projectList.innerHTML = '<div class="project-item">Failed to load projects</div>';
    }
}

// Send initial project status request
async function sendProjectStatusRequest() {
    hasLoadedProjects = true;
    
    // Clear welcome message
    const messagesEl = document.getElementById('chat-messages');
    messagesEl.innerHTML = '';
    
    await sendMessage("Give me a brief status update on all current Echo AI Systems projects", true);
}

// Setup input handlers
function setupInputHandlers() {
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-button');
    const charCount = document.getElementById('char-current');
    
    // Auto-resize textarea
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
        charCount.textContent = input.value.length;
    });
    
    // Handle Enter key
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Send button
    sendBtn.addEventListener('click', () => sendMessage());
}

// Add message to chat
function addMessage(content, isUser = false, isThinking = false) {
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
        
        // Format content
        content = formatMessage(content);
        messageInner.innerHTML = content;
        
        messageContent.appendChild(messageInner);
        messageDiv.appendChild(messageContent);
        
        // Store in conversation history
        conversationHistory.push({
            role: isUser ? 'user' : 'assistant',
            content: content.replace(/<[^>]*>/g, '') // Strip HTML
        });
    }
    
    messagesEl.appendChild(messageDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    // Update message count
    if (!isThinking) {
        messageCount++;
        document.getElementById('total-messages').textContent = messageCount;
    }
}

// Format message content
function formatMessage(content) {
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
}

// Show/hide thinking indicator
function showTyping() {
    addMessage('', false, true);
}

function hideTyping() {
    const indicator = document.getElementById('thinking-indicator');
    if (indicator) indicator.remove();
}

// Send message
async function sendMessage(message, isFirstMessage = false) {
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-button');
    const text = message || input.value.trim();
    
    if (!text) return;
    
    // Disable input
    input.disabled = true;
    sendBtn.disabled = true;
    
    // Clear and reset input
    if (!message) {
        input.value = '';
        input.style.height = 'auto';
        document.getElementById('char-current').textContent = '0';
    }
    
    // Add user message
    addMessage(text, true);
    
    // Check if it's a task
    const isTask = text.toLowerCase().includes('task') || 
                   text.toLowerCase().includes('todo') || 
                   text.toLowerCase().includes('request') ||
                   text.toLowerCase().includes('need echo to') ||
                   text.toLowerCase().includes('ask echo to');
    
    if (isTask) {
        taskCount++;
        document.getElementById('total-tasks').textContent = taskCount;
    }
    
    // Show typing
    showTyping();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: text,
                conversationId: conversationId,
                messageNumber: messageCount,
                isFirstMessage: isFirstMessage,
                conversationHistory: conversationHistory.slice(-10)
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
            showNotification('Error processing message', 'error');
        } else {
            addMessage(data.response || 'No response received');
            
            if (data.saved) {
                document.getElementById('save-status').textContent = '✓ Saved';
                setTimeout(() => {
                    document.getElementById('save-status').textContent = 'Auto-save enabled';
                }, 2000);
            }
        }
        
    } catch (error) {
        hideTyping();
        console.error('Error:', error);
        addMessage(`System Error: ${error.message}`);
        showNotification('Failed to send message', 'error');
    } finally {
        // Re-enable input
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Monitor latency
function monitorLatency() {
    setInterval(async () => {
        if (isConnected) {
            try {
                const startTime = Date.now();
                await fetch('/api/health');
                const latency = Date.now() - startTime;
                document.getElementById('connection-ping').textContent = `Latency: ${latency}ms`;
            } catch (error) {
                // Silent fail
            }
        }
    }, 10000); // Every 10 seconds
}

// Auto-save conversation summary
setInterval(async () => {
    if (messageCount > 0 && isConnected) {
        try {
            await fetch('/api/conversation/summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    conversationId: conversationId,
                    messageCount: messageCount
                })
            });
        } catch (error) {
            console.error('Failed to save conversation summary:', error);
        }
    }
}, 60000); // Every minute

// Make functions available globally
window.sendMessage = sendMessage;
