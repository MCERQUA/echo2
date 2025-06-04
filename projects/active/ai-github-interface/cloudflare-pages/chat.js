// Cloudflare Pages version - uses relative API paths
let apiUrl = '/api';

// Check connection on load
window.addEventListener('DOMContentLoaded', async () => {
    await checkConnection();
});

async function checkConnection() {
    const statusEl = document.getElementById('status');
    try {
        const response = await fetch(`${apiUrl}/health`);
        const data = await response.json();
        statusEl.textContent = `Connected to API • ${new Date().toLocaleTimeString()}`;
        statusEl.className = 'mt-4 text-center text-sm text-green-500';
    } catch (error) {
        statusEl.textContent = 'Connecting to API...';
        statusEl.className = 'mt-4 text-center text-sm text-yellow-500';
    }
}

function addMessage(content, isUser = false) {
    const messagesEl = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message mb-4 ${isUser ? 'text-right' : 'text-left'}`;
    
    const bubble = document.createElement('div');
    bubble.className = `inline-block px-4 py-2 rounded-lg max-w-xs md:max-w-md ${
        isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
    }`;
    bubble.textContent = content;
    
    messageDiv.appendChild(bubble);
    messagesEl.appendChild(messageDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function showTyping() {
    const messagesEl = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message mb-4 text-left';
    typingDiv.innerHTML = `
        <div class="inline-block px-4 py-2 rounded-lg bg-gray-700">
            <div class="flex space-x-2">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
        </div>
    `;
    messagesEl.appendChild(typingDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

function hideTyping() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function sendMessage(message) {
    const input = document.getElementById('message-input');
    const text = message || input.value.trim();
    
    if (!text) return;
    
    // Clear input
    if (!message) {
        input.value = '';
    }
    
    // Add user message
    addMessage(text, true);
    
    // Show typing indicator
    showTyping();
    
    try {
        const response = await fetch(`${apiUrl}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: text })
        });
        
        hideTyping();
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            addMessage(`Error: ${data.error}`);
        } else {
            addMessage(data.response || 'No response received');
        }
        
    } catch (error) {
        hideTyping();
        console.error('Error:', error);
        addMessage('Sorry, there was an error processing your request.');
        
        const statusEl = document.getElementById('status');
        statusEl.textContent = 'Connection error - Retrying...';
        statusEl.className = 'mt-4 text-center text-sm text-red-500';
        
        // Try to reconnect
        setTimeout(checkConnection, 2000);
    }
}