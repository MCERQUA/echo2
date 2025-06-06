// AI Message Server - Enhanced Chat Interface with OpenAI Function Calling
let isConnected = false;
let conversationId = null;
let messageCount = 0;
let hasLoadedProjects = false;
let conversationHistory = []; // Store full conversation history

// Generate unique conversation ID
function generateConversationId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `conv-${timestamp}-${random}`;
}

// Initialize conversation
window.addEventListener('DOMContentLoaded', async () => {
    conversationId = generateConversationId();
    await checkConnection();
    
    // Automatically send project status request on first load
    if (isConnected && !hasLoadedProjects) {
        setTimeout(() => {
            sendProjectStatusRequest();
        }, 1000);
    }
});

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
    
    // Store in conversation history (except thinking indicators)
    if (!isThinking) {
        conversationHistory.push({
            role: isUser ? 'user' : 'assistant',
            content: content.replace(/<[^>]*>/g, '') // Strip HTML for clean history
        });
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
        // Build messages array for OpenAI format
        const messages = conversationHistory.slice(-10).concat([
            { role: 'user', content: text }
        ]);
        
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                messages: messages
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
            
            // Show cost estimate in status
            if (data.usage && data.usage.estimated_cost) {
                const statusEl = document.getElementById('status');
                statusEl.textContent = `✓ Response cost: ${data.usage.estimated_cost}`;
                statusEl.style.color = '#10b981';
                setTimeout(() => {
                    statusEl.textContent = '';
                }, 5000);
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

// Make sendMessage available globally
window.sendMessage = sendMessage;

// Check monthly cost estimate
async function checkCostEstimate() {
    try {
        const response = await fetch('/api/cost-estimate');
        if (response.ok) {
            const data = await response.json();
            console.log('Monthly cost estimate:', data);
        }
    } catch (error) {
        console.error('Failed to get cost estimate:', error);
    }
}

// Check cost estimate on load
window.addEventListener('DOMContentLoaded', checkCostEstimate);
