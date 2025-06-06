// AI Message Server Worker - Groq Integration
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
          let githubOperation = false;
          
          // Check if this is a GitHub operation
          if (message.toLowerCase().includes('github') || 
              message.toLowerCase().includes('repository') || 
              message.toLowerCase().includes('repo')) {
            githubOperation = true;
            
            // Handle GitHub operations
            if (message.toLowerCase().includes('list') && message.toLowerCase().includes('repositories')) {
              if (!env.GITHUB_TOKEN) {
                aiResponse = 'GitHub token not configured. Please ask Echo to configure the GITHUB_TOKEN environment variable.';
              } else {
                try {
                  const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
                    headers: {
                      'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
                      'Accept': 'application/vnd.github.v3+json',
                      'User-Agent': 'Echo-AI-Message-Server'
                    }
                  });
                  
                  if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status}`);
                  }
                  
                  const repos = await response.json();
                  
                  if (repos.length === 0) {
                    aiResponse = 'No repositories found. Make sure your GitHub token has the correct permissions.';
                  } else {
                    const repoList = repos.map(r => `- **${r.full_name}** (${r.private ? 'private' : 'public'}) - ${r.description || 'No description'}`).join('\n');
                    aiResponse = `Found ${repos.length} repositories:\n\n${repoList}`;
                  }
                } catch (error) {
                  aiResponse = `Error fetching repositories: ${error.message}`;
                }
              }
            } else {
              aiResponse = 'I can help with GitHub operations. Try asking me to "list my repositories" or specify what you\'d like to do.';
            }
          }
          
          // If not a GitHub operation, use Groq AI
          if (!githubOperation) {
            if (!env.GROQ_API_KEY) {
              aiResponse = 'Groq API key not configured. Please ask Echo to configure the GROQ_API_KEY environment variable.';
            } else {
              try {
                const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    model: 'mixtral-8x7b-32768',
                    messages: [
                      {
                        role: 'system',
                        content: 'You are a helpful AI assistant for Echo AI Systems. You help users with their requests and questions. When users want to create tasks for Echo, acknowledge their request and let them know it will be saved for Echo to review. Be concise but friendly.'
                      },
                      {
                        role: 'user',
                        content: message
                      }
                    ],
                    temperature: 0.7,
                    max_tokens: 1024
                  })
                });
                
                if (!groqResponse.ok) {
                  const errorData = await groqResponse.text();
                  throw new Error(`Groq API error: ${groqResponse.status} - ${errorData}`);
                }
                
                const groqData = await groqResponse.json();
                aiResponse = groqData.choices[0].message.content;
                
              } catch (error) {
                console.error('Groq API error:', error);
                aiResponse = `I'm having trouble connecting to the AI service. Error: ${error.message}`;
              }
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
              
              const fileContent = `---
id: ${conversationId}-${messageNumber}
timestamp: ${timestamp}
client: web-interface
type: message
status: new
---

# User Message

${message}

# AI Response

${aiResponse}
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