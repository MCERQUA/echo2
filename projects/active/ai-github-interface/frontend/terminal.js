// Echo AI Communication Terminal - Enhanced JavaScript with Image Support
let isConnected = false;
let messageCount = 0;
let hasLoadedProjects = false;
let conversationHistory = [];
let taskCount = 0;

// Wait for chat.js to initialize session
window.addEventListener('DOMContentLoaded', async () => {
    // Give chat.js time to initialize
    setTimeout(async () => {
        // Get sessionId from chat.js if available
        if (window.sessionId) {
            updateSessionDisplay(window.sessionId);
        }
        
        // Initialize components
        await checkConnection();
        loadProjects();
        setupInputHandlers();
        setupMobileHandlers();
        
        // Auto-load project status after connection
        if (isConnected && !hasLoadedProjects) {
            setTimeout(() => {
                sendProjectStatusRequest();
            }, 1500);
        }
        
        // Start latency monitoring
        monitorLatency();
    }, 500); // Wait 500ms for chat.js to initialize
});

// Update session display
function updateSessionDisplay(sessionId) {
    const sessionEl = document.getElementById('conversation-id');
    if (sessionEl && sessionId) {
        sessionEl.textContent = `Session: ${sessionId.slice(0, 8)}...`;
        sessionEl.dataset.fullId = sessionId;
    }
}

// Setup mobile-specific handlers
function setupMobileHandlers() {
    // Session ID click to expand on mobile
    const sessionEl = document.getElementById('conversation-id');
    if (sessionEl) {
        sessionEl.classList.add('session-clickable');
        sessionEl.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                this.classList.toggle('expanded');
                if (this.classList.contains('expanded')) {
                    this.textContent = `Session: ${this.dataset.fullId || 'Initializing...'}`;
                } else {
                    const id = this.dataset.fullId || 'Initializing...';
                    this.textContent = `Session: ${id.slice(0, 8)}...`;
                }
            }
        });
    }
}

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
            
            // Remove welcome message once connected
            const welcomeMsg = document.querySelector('.welcome-message');
            if (welcomeMsg) {
                setTimeout(() => {
                    welcomeMsg.style.opacity = '0';
                    setTimeout(() => welcomeMsg.remove(), 500);
                }, 1000);
            }
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
    if (!projectList) return; // Skip if sidebar not visible (mobile)
    
    // Default projects for Echo AI Systems
    const defaultProjects = [
        {
            name: "echo-cnn",
            description: "AI-powered news aggregation system",
            category: "Media",
            status: "active"
        },
        {
            name: "VisionEcho Project",
            description: "Computer vision and image recognition",
            category: "AI/ML",
            status: "active"
        },
        {
            name: "china-dictatorship",
            description: "Research on governance systems",
            category: "Research",
            status: "planned"
        },
        {
            name: "OpenPacketFix",
            description: "Network protocol optimization",
            category: "Infrastructure",
            status: "active"
        }
    ];
    
    try {
        const response = await fetch('/api/projects');
        let projects = defaultProjects;
        
        if (response.ok) {
            const data = await response.json();
            if (data.projects && data.projects.length > 0) {
                projects = data.projects;
            }
        }
        
        projectList.innerHTML = '';
        
        // Update counter
        const counterNumber = document.querySelector('.counter-number');
        if (counterNumber) {
            counterNumber.textContent = projects.length;
        }
        
        // Add project items
        projects.forEach((project, index) => {
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
    } catch (error) {
        console.error('Failed to load projects:', error);
        // Use default projects on error
        if (projectList) {
            loadDefaultProjects(projectList, defaultProjects);
        }
    }
}

function loadDefaultProjects(projectList, projects) {
    projectList.innerHTML = '';
    const counterNumber = document.querySelector('.counter-number');
    if (counterNumber) {
        counterNumber.textContent = projects.length;
    }
    
    projects.forEach((project, index) => {
        const projectEl = document.createElement('div');
        projectEl.className = 'project-item';
        projectEl.style.animationDelay = `${index * 0.05}s`;
        
        const statusColor = project.status === 'active' ? '#10b981' : '#f59e0b';
        
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
        
        projectList.appendChild(projectEl);
    });
}

// Send initial project status request
async function sendProjectStatusRequest() {
    hasLoadedProjects = true;
    
    // Clear welcome message
    const messagesEl = document.getElementById('chat-messages');
    const welcomeMsg = messagesEl.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }
    
    // Send request in English
    await sendMessage("List my GitHub repositories", true);
}

// Setup input handlers
function setupInputHandlers() {
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-button');
    const charCount = document.getElementById('char-current');
    
    if (!input || !sendBtn) return;
    
    // Auto-resize textarea
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = input.scrollHeight + 'px';
        if (charCount) {
            charCount.textContent = input.value.length;
        }
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

// Add message to chat with enhanced image support
function addMessage(content, isUser = false, isThinking = false, images = [], toolCalls = []) {
    const messagesEl = document.getElementById('chat-messages');
    if (!messagesEl) return;
    
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
        
        // Add tool usage indicators if present
        if (toolCalls && toolCalls.length > 0) {
            const toolsDiv = document.createElement('div');
            toolsDiv.className = 'tool-usage';
            toolsDiv.style.cssText = 'margin-top: 0.5rem; padding: 0.5rem; background: rgba(16, 185, 129, 0.1); border-radius: 4px; font-size: 0.85em;';
            
            const toolNames = toolCalls.map(tc => tc.function.name).join(', ');
            toolsDiv.innerHTML = `🔧 Used tools: ${toolNames}`;
            messageInner.appendChild(toolsDiv);
        }
        
        // Add images if present
        if (images && images.length > 0) {
            const imagesContainer = document.createElement('div');
            imagesContainer.className = 'message-images';
            imagesContainer.style.cssText = 'margin-top: 1rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;';
            
            images.forEach(img => {
                const imageWrapper = document.createElement('div');
                imageWrapper.style.cssText = 'position: relative; border-radius: 8px; overflow: hidden; background: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.2);';
                
                const imageEl = document.createElement('img');
                imageEl.src = img.url || img.image_base64 || img.image_url;
                imageEl.alt = img.prompt || 'AI generated image';
                imageEl.style.cssText = 'width: 100%; height: auto; display: block; cursor: pointer;';
                imageEl.loading = 'lazy';
                
                // Click to expand
                imageEl.addEventListener('click', () => {
                    expandImage(imageEl.src, imageEl.alt);
                });
                
                imageWrapper.appendChild(imageEl);
                
                // Add metadata overlay
                if (img.model || img.github_url) {
                    const metaDiv = document.createElement('div');
                    metaDiv.style.cssText = 'position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0, 0, 0, 0.8); color: white; padding: 0.5rem; font-size: 0.75rem;';
                    
                    let metaContent = '';
                    if (img.model) metaContent += `Model: ${img.model}`;
                    if (img.github_url) {
                        metaContent += ` | <a href="${img.github_url}" target="_blank" style="color: #10b981;">View on GitHub</a>`;
                    }
                    metaDiv.innerHTML = metaContent;
                    
                    imageWrapper.appendChild(metaDiv);
                }
                
                imagesContainer.appendChild(imageWrapper);
            });
            
            messageInner.appendChild(imagesContainer);
        }
        
        messageContent.appendChild(messageInner);
        messageDiv.appendChild(messageContent);
        
        // Store in conversation history
        conversationHistory.push({
            role: isUser ? 'user' : 'assistant',
            content: content.replace(/<[^>]*>/g, ''), // Strip HTML
            images: images
        });
    }
    
    messagesEl.appendChild(messageDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    
    // Update message count
    if (!isThinking) {
        messageCount++;
        const totalMsgs = document.getElementById('total-messages');
        if (totalMsgs) {
            totalMsgs.textContent = messageCount;
        }
    }
}

// Expand image in modal
function expandImage(src, alt) {
    // Remove existing modal if any
    const existingModal = document.getElementById('image-modal');
    if (existingModal) existingModal.remove();
    
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'image-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        cursor: pointer;
        padding: 2rem;
    `;
    
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.style.cssText = 'max-width: 90%; max-height: 90%; object-fit: contain;';
    
    modal.appendChild(img);
    
    // Close on click
    modal.addEventListener('click', () => modal.remove());
    
    document.body.appendChild(modal);
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

// Parse response for images
function parseResponseForImages(response) {
    const images = [];
    
    // Check for image URLs in the response
    const imageUrlPattern = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/gi;
    const matches = response.match(imageUrlPattern);
    
    if (matches) {
        matches.forEach(url => {
            images.push({ url, type: 'url' });
        });
    }
    
    // Check for base64 images
    const base64Pattern = /data:image\/(png|jpeg|jpg|gif|webp);base64,[^\s]+/gi;
    const base64Matches = response.match(base64Pattern);
    
    if (base64Matches) {
        base64Matches.forEach(data => {
            images.push({ url: data, type: 'base64' });
        });
    }
    
    return images;
}

// Send message
async function sendMessage(message, isFirstMessage = false) {
    const input = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-button');
    const text = message || input.value.trim();
    
    if (!text) return;
    
    // Disable input
    if (input) input.disabled = true;
    if (sendBtn) sendBtn.disabled = true;
    
    // Clear and reset input
    if (!message && input) {
        input.value = '';
        input.style.height = 'auto';
        const charCount = document.getElementById('char-current');
        if (charCount) charCount.textContent = '0';
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
        const totalTasks = document.getElementById('total-tasks');
        if (totalTasks) {
            totalTasks.textContent = taskCount;
        }
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
                sessionId: window.sessionId // Use sessionId from chat.js
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
            // Extract images from tool calls if present
            let images = [];
            if (data.tool_calls) {
                data.tool_calls.forEach(toolCall => {
                    if (toolCall.function.name.includes('image')) {
                        try {
                            const result = JSON.parse(toolCall.result || '{}');
                            if (result.image_url || result.image_base64) {
                                images.push(result);
                            }
                            if (result.results) {
                                // Multiple images from generate_multiple_images
                                result.results.forEach(r => {
                                    if (r.image_url || r.image_base64) {
                                        images.push(r);
                                    }
                                });
                            }
                        } catch (e) {
                            console.error('Error parsing tool result:', e);
                        }
                    }
                });
            }
            
            // Also check for images in the response text
            const textImages = parseResponseForImages(data.response || '');
            images = [...images, ...textImages];
            
            // Add message with images
            addMessage(data.response || 'No response received', false, false, images, data.tool_calls);
            
            // Show cost if available
            if (data.usage && data.usage.estimated_cost) {
                showNotification(`Cost: ${data.usage.estimated_cost}`, 'info');
            }
        }
        
    } catch (error) {
        hideTyping();
        console.error('Error:', error);
        addMessage(`System Error: ${error.message}`);
        showNotification('Failed to send message', 'error');
    } finally {
        // Re-enable input
        if (input) {
            input.disabled = false;
            input.focus();
        }
        if (sendBtn) sendBtn.disabled = false;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
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
                const pingEl = document.getElementById('connection-ping');
                if (pingEl) {
                    pingEl.textContent = `Latency: ${latency}ms`;
                }
            } catch (error) {
                // Silent fail
            }
        }
    }, 10000); // Every 10 seconds
}

// Make functions available globally
window.sendMessage = sendMessage;
