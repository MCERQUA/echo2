// AI Message Server Worker - Groq Integration with Echo System Prompt
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Health check endpoint
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            groq: !!env.GROQ_API_KEY,
            github: !!env.GITHUB_TOKEN
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Main chat endpoint
      if (url.pathname === '/api/chat' && request.method === 'POST') {
        try {
          const { message, conversationId, messageNumber } = await request.json();
          
          // Log for debugging
          console.log('Received message:', message);
          console.log('Conversation ID:', conversationId);
          
          let aiResponse = '';
          
          // System prompt that defines the AI's role and capabilities
          const systemPrompt = `You are Echo's AI Message Center Assistant. Your role is to:

1. **Receive and Process Requests**: Accept messages, tasks, and requests from clients for Echo to review later
2. **Access GitHub Repositories**: You can read files from ANY GitHub repository to provide project updates and information
3. **Message Queue Management**: All conversations are saved to the ECHO-MESSAGE-SERVER repository only
4. **Project Awareness**: You have knowledge of Echo AI Systems projects and can provide updates when asked
5. **Task Creation**: When users request tasks for Echo, acknowledge them and note they'll be saved for review

IMPORTANT RULES:
- You can READ from any GitHub repository to provide information
- You can only WRITE to the ECHO-MESSAGE-SERVER repository
- Be helpful and informative about Echo's projects when asked
- When users submit tasks, confirm receipt and that Echo will review them
- You are an extension of Echo AI Systems, not a separate entity

Available capabilities:
- List and read repositories
- View file contents from any repo
- Create tasks and messages in ECHO-MESSAGE-SERVER
- Provide project status updates
- Answer questions about Echo AI Systems services

Remember: You are Echo's message center, collecting and organizing communications for later review.`;

          if (!env.GROQ_API_KEY) {
            aiResponse = 'Groq API key not configured. Please ask Echo to configure the GROQ_API_KEY environment variable.';
          } else {
            try {
              // Prepare conversation history if needed
              const messages = [
                {
                  role: 'system',
                  content: systemPrompt
                },
                {
                  role: 'user',
                  content: message
                }
              ];

              // If message mentions GitHub operations, enhance the context
              if (message.toLowerCase().includes('github') || 
                  message.toLowerCase().includes('repository') || 
                  message.toLowerCase().includes('repo') ||
                  message.toLowerCase().includes('file') ||
                  message.toLowerCase().includes('project')) {
                
                // Add GitHub context to the system message
                messages[0].content += `\n\nThe user may be asking about GitHub operations. You have access to GitHub via the configured token. You can list repositories, read files, and provide project information. Remember to only write to ECHO-MESSAGE-SERVER.`;
              }

              const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${env.GROQ_API_KEY}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  model: 'mixtral-8x7b-32768',
                  messages: messages,
                  temperature: 0.7,
                  max_tokens: 2048
                })
              });
              
              if (!groqResponse.ok) {
                const errorData = await groqResponse.text();
                throw new Error(`Groq API error: ${groqResponse.status} - ${errorData}`);
              }
              
              const groqData = await groqResponse.json();
              aiResponse = groqData.choices[0].message.content;
              
              // If the AI response mentions needing to perform GitHub operations, handle them
              if (aiResponse.includes('list') && aiResponse.includes('repositories') && env.GITHUB_TOKEN) {
                // Fetch repositories
                const repoResponse = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
                  headers: {
                    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Echo-AI-Message-Server'
                  }
                });
                
                if (repoResponse.ok) {
                  const repos = await repoResponse.json();
                  const repoList = repos.map(r => `- **${r.full_name}** (${r.private ? 'private' : 'public'}) - ${r.description || 'No description'}`).join('\\n');
                  aiResponse += `\\n\\nHere are your recent repositories:\\n${repoList}`;
                }
              }
              
            } catch (error) {
              console.error('Groq API error:', error);
              aiResponse = `I'm having trouble connecting to the AI service. Error: ${error.message}`;
            }
          }
          
          // Save message to GitHub (ECHO-MESSAGE-SERVER)
          let saved = false;
          if (env.GITHUB_TOKEN) {
            try {
              const date = new Date();
              const dateFolder = date.toISOString().split('T')[0];
              const timestamp = date.toISOString();
              const fileName = `${conversationId}-msg-${String(messageNumber).padStart(4, '0')}.md`;
              const filePath = `messages/${dateFolder}/${fileName}`;
              
              // Determine if this is a task request
              const isTask = message.toLowerCase().includes('task') || 
                             message.toLowerCase().includes('todo') || 
                             message.toLowerCase().includes('request') ||
                             message.toLowerCase().includes('need echo to') ||
                             message.toLowerCase().includes('ask echo to');
              
              const fileContent = `---
id: ${conversationId}-${messageNumber}
timestamp: ${timestamp}
client: web-interface
type: ${isTask ? 'task' : 'message'}
status: new
priority: ${isTask ? 'normal' : 'low'}
---

# User Message

${message}

# AI Response

${aiResponse}

${isTask ? `\n# Task Extraction\n\nThis appears to be a task request for Echo to review.\n` : ''}
`;
              
              const githubResponse = await fetch(`https://api.github.com/repos/MCERQUA/ECHO-MESSAGE-SERVER/contents/${filePath}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
                  'Accept': 'application/vnd.github.v3+json',
                  'User-Agent': 'Echo-AI-Message-Server'
                },
                body: JSON.stringify({
                  message: `Add message ${messageNumber} from conversation ${conversationId}`,
                  content: btoa(unescape(encodeURIComponent(fileContent)))
                })
              });
              
              saved = githubResponse.ok;
              
              if (!saved) {
                console.error('Failed to save to GitHub:', await githubResponse.text());
              }
              
              // If it's a task, also save to tasks folder
              if (isTask && saved) {
                const taskFileName = `${conversationId}-task-${String(messageNumber).padStart(4, '0')}.md`;
                const taskFilePath = `tasks/pending/${taskFileName}`;
                
                const taskContent = `---
id: ${conversationId}-task-${messageNumber}
created: ${timestamp}
conversationId: ${conversationId}
messageNumber: ${messageNumber}
status: pending
priority: normal
---

# Task Request

${message}

# Initial AI Response

${aiResponse}

# Source

From conversation ${conversationId}, message ${messageNumber}
`;
                
                await fetch(`https://api.github.com/repos/MCERQUA/ECHO-MESSAGE-SERVER/contents/${taskFilePath}`, {
                  method: 'PUT',
                  headers: {
                    'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Echo-AI-Message-Server'
                  },
                  body: JSON.stringify({
                    message: `Add task from conversation ${conversationId}`,
                    content: btoa(unescape(encodeURIComponent(taskContent)))
                  })
                });
              }
              
            } catch (error) {
              console.error('Error saving to GitHub:', error);
            }
          }
          
          return new Response(JSON.stringify({
            response: aiResponse,
            saved: saved
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
          
        } catch (error) {
          console.error('Chat error:', error);
          return new Response(JSON.stringify({ 
            error: `Server error: ${error.message}` 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
      
      // Save conversation summary
      if (url.pathname === '/api/conversation/summary' && request.method === 'POST') {
        try {
          const { conversationId, messageCount } = await request.json();
          
          if (env.GITHUB_TOKEN) {
            const date = new Date();
            const dateFolder = date.toISOString().split('T')[0];
            const filePath = `conversations/${dateFolder}/${conversationId}-summary.md`;
            
            const fileContent = `---
conversationId: ${conversationId}
lastUpdated: ${date.toISOString()}
messageCount: ${messageCount}
status: active
---

# Conversation Summary

Conversation ID: ${conversationId}
Total Messages: ${messageCount}
Last Updated: ${date.toISOString()}
`;
            
            await fetch(`https://api.github.com/repos/MCERQUA/ECHO-MESSAGE-SERVER/contents/${filePath}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Echo-AI-Message-Server'
              },
              body: JSON.stringify({
                message: `Update conversation summary for ${conversationId}`,
                content: btoa(unescape(encodeURIComponent(fileContent)))
              })
            });
          }
          
          return new Response(JSON.stringify({ success: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
          
        } catch (error) {
          console.error('Summary save error:', error);
          return new Response(JSON.stringify({ 
            error: `Failed to save summary: ${error.message}` 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }
    
    // Let Pages handle everything else (HTML, JS, CSS)
    return env.ASSETS.fetch(request);
  }
};
