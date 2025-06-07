// Input Handler Fix - Ensures proper Enter key behavior and send button functionality
(function() {
    'use strict';
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        // Give terminal.js time to initialize first
        setTimeout(initInputFix, 100);
    });
    
    function initInputFix() {
        const input = document.getElementById('message-input');
        const sendBtn = document.getElementById('send-button');
        
        if (!input || !sendBtn) {
            console.error('Input or send button not found');
            return;
        }
        
        // Remove any existing event listeners
        const newInput = input.cloneNode(true);
        input.parentNode.replaceChild(newInput, input);
        
        const newSendBtn = sendBtn.cloneNode(true);
        sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
        
        // Re-attach proper event listeners
        setupInputHandlers(newInput, newSendBtn);
        
        console.log('Input handler fix applied');
    }
    
    function setupInputHandlers(input, sendBtn) {
        // Auto-resize textarea
        input.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
            
            const charCount = document.getElementById('char-current');
            if (charCount) {
                charCount.textContent = this.value.length;
            }
        });
        
        // Handle Enter key properly
        input.addEventListener('keydown', function(e) {
            // Enter without Shift = Send message
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                sendMessage();
                return false;
            }
            // Shift+Enter = New line (default behavior)
        });
        
        // Send button click
        sendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            sendMessage();
        });
        
        // Make send button more accessible
        sendBtn.style.cursor = 'pointer';
        sendBtn.setAttribute('type', 'button');
        
        // Ensure send button is properly styled
        if (!sendBtn.classList.contains('send-btn')) {
            sendBtn.classList.add('send-btn');
        }
    }
    
    function sendMessage() {
        // Use the global sendMessage function if available
        if (typeof window.sendMessage === 'function') {
            window.sendMessage();
        } else {
            console.error('sendMessage function not found');
            // Fallback: trigger send manually
            const input = document.getElementById('message-input');
            if (input && input.value.trim()) {
                // Dispatch a custom event that terminal.js might listen to
                const event = new CustomEvent('send-message', {
                    detail: { message: input.value.trim() }
                });
                document.dispatchEvent(event);
            }
        }
    }
    
    // Also fix Ctrl+K for new session
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (typeof window.clearSession === 'function') {
                window.clearSession();
            }
        }
    });
    
})();
