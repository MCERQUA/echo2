// AI Message Server - Enhanced Chat Interface
let isConnected = false;
let conversationId = null;
let messageCount = 0;

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
});

async function checkConnection() {
    const statusEl = document.getElementById('connectionStatus');
    const statusDot = statusEl.querySelector('.status-dot');
    const statusText = statusEl.querySelector('.status-text');
    
    try {
        const response = await fetch('/api/health');
        if (response.ok) {
            const data = await response.json();
            statusDot.className = 'status-dot connected';
            statusText.textContent = 'Connected';
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

function addMessage(content, isUser = false, isThinking = false) {
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
            .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 p-2 rounded mt-2"><code>$1</code></pre>') // Code blocks
            .replace(/`([^`]+)`/g, '<code class="bg-gray-800 px-1 rounded">$1</code>') // Inline code
            .replace(/\n/g, '<br>'); // Line breaks
        
        bubble.innerHTML = content;
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

async function sendMessage(message) {
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
                conversationId: conversationId,
                messageNumber: messageCount
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
            addMessage(data.response || 'No response received');
            
            // Show status if message was saved
            if (data.saved) {
                const statusEl = document.getElementById('status');
                statusEl.textContent = '✓ Message saved to ECHO-MESSAGE-SERVER';
                statusEl.style.color = '#10b981';
                setTimeout(() => {
                    statusEl.textContent = '';
                }, 3000);
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

// Auto-save conversation summary periodically
setInterval(async () => {
    if (messageCount > 0) {
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