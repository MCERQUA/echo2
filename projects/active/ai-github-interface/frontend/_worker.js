// Echo AI Interface - 100% Cloudflare Self-Contained
// ZERO GitHub file dependencies - R2 frontend + GitHub MCP tools only
// Updated to remove ALL GitHub file serving

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
        'Access-Control-Allow-Headers': 'Content-Type, X-Session-ID',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      const SESSIONS = env.SESSIONS || env.KV;
      const ECHO_TOOLS = [
        {
          type: "function",
          function: {
            name: "search_repositories",
            description: "Search for GitHub repositories",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string", description: "Search query" },
                perPage: { type: "number", description: "Results per page (max 100)" },
                page: { type: "number", description: "Page number" }
              },
              required: ["query"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_file_contents",
            description: "Get contents of a file or directory from GitHub",
            parameters: {
              type: "object",
              properties: {
                owner: { type: "string", description: "Repository owner" },
                repo: { type: "string", description: "Repository name" },
                path: { type: "string", description: "File or directory path" },
                branch: { type: "string", description: "Branch name (default: main)" }
              },
              required: ["owner", "repo", "path"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "create_or_update_file",
            description: "Create or update a file in GitHub",
            parameters: {
              type: "object",
              properties: {
                owner: { type: "string" },
                repo: { type: "string" },
                path: { type: "string" },
                content: { type: "string" },
                message: { type: "string" },
                branch: { type: "string" },
                sha: { type: "string", description: "SHA of file being replaced (for updates)" }
              },
              required: ["owner", "repo", "path", "content", "message", "branch"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "create_issue",
            description: "Create a new issue in a GitHub repository",
            parameters: {
              type: "object",
              properties: {
                owner: { type: "string" },
                repo: { type: "string" },
                title: { type: "string" },
                body: { type: "string" },
                labels: { type: "array", items: { type: "string" } }
              },
              required: ["owner", "repo", "title"]
            }
          }
        },
        {
          type: "function", 
          function: {
            name: "list_issues",
            description: "List issues in a GitHub repository",
            parameters: {
              type: "object",
              properties: {
                owner: { type: "string" },
                repo: { type: "string" },
                state: { type: "string", enum: ["open", "closed", "all"], description: "Filter by state" },
                per_page: { type: "number", description: "Results per page (max 100)" },
                page: { type: "number", description: "Page number" }
              },
              required: ["owner", "repo"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "save_message",
            description: "Save a message to R2 storage with metadata",
            parameters: {
              type: "object",
              properties: {
                messageId: { type: "string", description: "Unique message identifier" },
                sessionId: { type: "string", description: "Session identifier" },
                content: { type: "string", description: "Message content" },
                userType: { type: "string", enum: ["user", "assistant"], description: "Message sender type" },
                metadata: { type: "object", description: "Additional message metadata" }
              },
              required: ["messageId", "sessionId", "content", "userType"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "get_messages",
            description: "Retrieve messages from R2 storage by session or date range",
            parameters: {
              type: "object",
              properties: {
                sessionId: { type: "string", description: "Session identifier" },
                limit: { type: "number", description: "Maximum number of messages to retrieve" },
                startDate: { type: "string", description: "Start date for filtering (ISO string)" },
                endDate: { type: "string", description: "End date for filtering (ISO string)" }
              }
            }
          }
        },
        {
          type: "function",
          function: {
            name: "save_conversation_summary",
            description: "Save a conversation summary to R2 storage",
            parameters: {
              type: "object",
              properties: {
                sessionId: { type: "string", description: "Session identifier" },
                summary: { type: "string", description: "Conversation summary" },
                messageCount: { type: "number", description: "Total messages in conversation" },
                duration: { type: "string", description: "Conversation duration" },
                topics: { type: "array", items: { type: "string" }, description: "Main topics discussed" }
              },
              required: ["sessionId", "summary", "messageCount"]
            }
          }
        },
        {
          type: "function",
          function: {
            name: "create_task",
            description: "Create a task in R2 storage for Echo to review later",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "Task title" },
                description: { type: "string", description: "Task description" },
                priority: { type: "string", enum: ["low", "medium", "high", "urgent"], description: "Task priority" },
                category: { type: "string", description: "Task category" },
                relatedSessionId: { type: "string", description: "Related conversation session" }
              },
              required: ["title", "description", "priority"]
            }
          }
        }
      ];

      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy',
          model: 'OpenAI gpt-4.1-nano',
          storage: 'Cloudflare R2',
          frontend: 'R2 Self-Contained',
          deployment: '100% Cloudflare',
          architecture: 'Worker + R2 + KV',
          features: ['session_threading', 'github_tools', 'r2_storage', 'message_persistence', 'r2_frontend'],
          cost_per_million: { input: 0.10, output: 0.40 },
          tools: ECHO_TOOLS.length,
          buckets: ['echo-messages', 'echo-conversations', 'echo-frontend'],
          bindings: {
            r2_messages: !!env.R2_MESSAGES,
            r2_conversations: !!env.R2_CONVERSATIONS,
            r2_frontend: !!env.R2_FRONTEND,
            kv_sessions: !!SESSIONS,
            openai: !!env.OPENAI_API_KEY,
            github: !!env.GITHUB_TOKEN
          },
          github_dependency: 'ZERO - MCP tools only for repo operations',
          file_serving: 'R2 buckets only - no GitHub files',
          migration_status: 'COMPLETE - 100% Cloudflare',
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (url.pathname === '/api/chat' && request.method === 'POST') {
        try {
          const { message, sessionId } = await request.json();
          
          if (!env.OPENAI_API_KEY) {
            return new Response(JSON.stringify({
              error: 'OpenAI API key not configured.'
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          let session = { messages: [] };
          if (sessionId && SESSIONS) {
            const sessionData = await SESSIONS.get(`session:${sessionId}`);
            if (sessionData) {
              session = JSON.parse(sessionData);
            }
          }

          const messageId = generateMessageId();

          if (env.R2_MESSAGES) {
            try {
              await saveMessageToR2(env.R2_MESSAGES, {
                messageId,
                sessionId: sessionId || 'ephemeral',
                content: message,
                userType: 'user',
                metadata: {
                  timestamp: new Date().toISOString(),
                  ip: request.headers.get('cf-connecting-ip') || 'unknown'
                }
              });
            } catch (error) {
              console.log('R2 save failed:', error.message);
            }
          }

          const userMessage = { role: 'user', content: message };
          session.messages.push(userMessage);

          const systemMessage = {
            role: 'system',
            content: `You are Echo's AI Assistant with GitHub tools and R2 storage.

DEPLOYMENT: 100% Cloudflare - Zero GitHub file dependencies!

CAPABILITIES:
- GitHub: Search repos, read/write files, manage issues  
- R2 Storage: Save messages, conversations, create tasks
- Session Management: Maintain conversation context
- Frontend: Served entirely from R2 storage

BEHAVIOR:
- Use GitHub tools for repository operations
- Use R2 storage tools to save conversations or create tasks
- Maintain context from previous messages
- Be helpful and concise

MIGRATION SUCCESS:
- Frontend: R2 Self-Contained (no GitHub file serving)
- Storage: R2 buckets for messages/conversations  
- Tools: GitHub MCP for repository operations only
- Sessions: KV storage for threading
- Cost: ~$0.50-1.00/month`
          };

          const recentMessages = session.messages.slice(-20);
          const openAIMessages = [systemMessage, ...recentMessages];

          const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4.1-nano-2025-04-14',
              messages: openAIMessages,
              tools: ECHO_TOOLS,
              tool_choice: 'auto',
              temperature: 0.7,
              max_tokens: 2048
            })
          });

          if (!openAIResponse.ok) {
            const error = await openAIResponse.text();
            throw new Error(`OpenAI API error: ${error}`);
          }

          const data = await openAIResponse.json();
          const aiMessage = data.choices[0].message;

          if (aiMessage.tool_calls) {
            const toolResults = [];
            
            for (const toolCall of aiMessage.tool_calls) {
              try {
                let result;
                const toolName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                
                if (['save_message', 'get_messages', 'save_conversation_summary', 'create_task'].includes(toolName)) {
                  result = await executeR2Tool(env, toolName, args);
                } else {
                  result = await executeGitHubTool(env.GITHUB_TOKEN, toolName, args);
                }
                
                toolResults.push({
                  tool_call_id: toolCall.id,
                  role: 'tool',
                  name: toolName,
                  content: JSON.stringify(result)
                });
              } catch (error) {
                toolResults.push({
                  tool_call_id: toolCall.id,
                  role: 'tool',
                  name: toolCall.function.name,
                  content: JSON.stringify({ error: error.message })
                });
              }
            }

            const finalResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'gpt-4.1-nano-2025-04-14',
                messages: [
                  ...openAIMessages,
                  aiMessage,
                  ...toolResults
                ],
                temperature: 0.7,
                max_tokens: 2048
              })
            });

            const finalData = await finalResponse.json();
            const finalMessage = finalData.choices[0].message;
            
            if (env.R2_MESSAGES) {
              try {
                await saveMessageToR2(env.R2_MESSAGES, {
                  messageId: generateMessageId(),
                  sessionId: sessionId || 'ephemeral',
                  content: finalMessage.content,
                  userType: 'assistant',
                  metadata: {
                    timestamp: new Date().toISOString(),
                    toolsUsed: aiMessage.tool_calls?.map(tc => tc.function.name) || []
                  }
                });
              } catch (error) {
                console.log('R2 save failed:', error.message);
              }
            }
            
            session.messages.push(finalMessage);
            
            const totalTokens = (data.usage?.total_tokens || 0) + (finalData.usage?.total_tokens || 0);
            const estimatedCost = (totalTokens / 1000000) * 0.50;
            
            if (sessionId && SESSIONS) {
              await SESSIONS.put(`session:${sessionId}`, JSON.stringify(session), {
                expirationTtl: 86400
              });
            }
            
            return new Response(JSON.stringify({
              response: finalMessage.content,
              sessionId: sessionId || 'ephemeral',
              messageId,
              architecture: '100% Cloudflare',
              storage: env.R2_MESSAGES ? 'R2 active' : 'R2 not configured',
              frontend: 'R2 self-contained',
              github_dependency: 'ZERO (MCP tools only)',
              usage: {
                ...finalData.usage,
                total_tokens: totalTokens,
                estimated_cost: `$${estimatedCost.toFixed(6)}`
              }
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          if (env.R2_MESSAGES) {
            try {
              await saveMessageToR2(env.R2_MESSAGES, {
                messageId: generateMessageId(),
                sessionId: sessionId || 'ephemeral',
                content: aiMessage.content,
                userType: 'assistant',
                metadata: {
                  timestamp: new Date().toISOString()
                }
              });
            } catch (error) {
              console.log('R2 save failed:', error.message);
            }
          }

          session.messages.push(aiMessage);
          
          if (sessionId && SESSIONS) {
            await SESSIONS.put(`session:${sessionId}`, JSON.stringify(session), {
              expirationTtl: 86400
            });
          }

          const estimatedCost = ((data.usage?.total_tokens || 0) / 1000000) * 0.50;
          
          return new Response(JSON.stringify({
            response: aiMessage.content,
            sessionId: sessionId || 'ephemeral',
            messageId,
            architecture: '100% Cloudflare',
            storage: env.R2_MESSAGES ? 'R2 active' : 'R2 not configured',
            frontend: 'R2 self-contained',
            github_dependency: 'ZERO (MCP tools only)',
            usage: {
              ...data.usage,
              estimated_cost: `$${estimatedCost.toFixed(6)}`
            }
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });

        } catch (error) {
          console.error('Chat error:', error);
          return new Response(JSON.stringify({
            error: error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      if (url.pathname === '/api/session' && request.method === 'POST') {
        const sessionId = generateSessionId();
        const session = { id: sessionId, created: new Date().toISOString(), messages: [], metadata: {} };
        
        if (SESSIONS) {
          await SESSIONS.put(`session:${sessionId}`, JSON.stringify(session), { expirationTtl: 86400 });
        }
        
        return new Response(JSON.stringify({ sessionId, message: 'Session created successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (url.pathname.match(/^\/api\/session\/(.+)$/) && request.method === 'GET') {
        const sessionId = url.pathname.split('/').pop();
        
        if (!SESSIONS) {
          return new Response(JSON.stringify({ error: 'Session storage not configured' }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const sessionData = await SESSIONS.get(`session:${sessionId}`);
        if (!sessionData) {
          return new Response(JSON.stringify({ error: 'Session not found' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const session = JSON.parse(sessionData);
        return new Response(JSON.stringify({ ...session, messageCount: session.messages.length }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (url.pathname.match(/^\/api\/session\/(.+)$/) && request.method === 'DELETE') {
        const sessionId = url.pathname.split('/').pop();
        if (SESSIONS) await SESSIONS.delete(`session:${sessionId}`);
        
        return new Response(JSON.stringify({ message: 'Session cleared' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (url.pathname === '/api/projects' && request.method === 'GET') {
        const projects = {
          projects: [
            {
              name: "echo-ai-interface",
              description: "100% Self-contained AI interface with R2 storage",
              category: "Interface",
              status: "operational",
              architecture: "Cloudflare Worker + R2 + KV",
              migration: "COMPLETE"
            },
            {
              name: "r2-storage-system", 
              description: "10GB message and conversation persistence",
              category: "Storage",
              status: "active",
              buckets: ["echo-frontend", "echo-messages", "echo-conversations"]
            },
            {
              name: "github-mcp-tools",
              description: "Repository operations and code management",
              category: "Integration", 
              status: "active",
              dependency: "MCP tools only - no file serving"
            }
          ]
        };
        
        return new Response(JSON.stringify(projects), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Serve frontend files from R2 storage ONLY - NO GitHub fallback
    if (env.R2_FRONTEND) {
      try {
        let filePath = url.pathname === '/' ? 'frontend/index.html' : `frontend${url.pathname}`;
        const object = await env.R2_FRONTEND.get(filePath);
        
        if (object) {
          const headers = new Headers();
          
          if (filePath.endsWith('.html')) {
            headers.set('Content-Type', 'text/html');
          } else if (filePath.endsWith('.css')) {
            headers.set('Content-Type', 'text/css');
          } else if (filePath.endsWith('.js')) {
            headers.set('Content-Type', 'application/javascript');
          } else if (filePath.endsWith('.json')) {
            headers.set('Content-Type', 'application/json');
          } else {
            headers.set('Content-Type', 'text/plain');
          }
          
          headers.set('Cache-Control', 'public, max-age=3600');
          headers.set('ETag', object.etag);
          
          return new Response(object.body, { headers });
        }
      } catch (error) {
        console.error('R2 frontend error:', error);
      }
    }
    
    // NO GITHUB FALLBACK - Show migration complete status or configuration error
    return new Response(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Echo AI - 100% Cloudflare Migration ${env.R2_FRONTEND ? 'Complete' : 'Pending'}</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            max-width: 900px; margin: 60px auto; padding: 40px; 
            background: #0a0a0a; color: #ffffff; text-align: center; 
            line-height: 1.6;
        }
        .logo { 
            width: 100px; height: 100px; 
            background: linear-gradient(135deg, #6366f1, #ec4899); 
            border-radius: 20px; margin: 0 auto 2rem; 
            display: flex; align-items: center; justify-content: center; 
            font-size: 3rem; font-weight: bold; 
            box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3);
        }
        .status { 
            background: #1a1a1a; border-radius: 16px; padding: 40px; margin: 40px 0; 
            border: 2px solid ${env.R2_FRONTEND ? '#10b981' : '#f59e0b'};
            position: relative;
        }
        .status::before { 
            content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; 
            border-radius: 16px 16px 0 0; 
            background: ${env.R2_FRONTEND ? '#10b981' : '#f59e0b'};
        }
        h1 { color: #6366f1; margin: 0 0 1rem 0; font-size: 3rem; font-weight: 700; }
        h2 { color: ${env.R2_FRONTEND ? '#10b981' : '#f59e0b'}; margin: 2rem 0 1.5rem 0; font-size: 1.8rem; }
        code { 
            background: #333; padding: 6px 12px; border-radius: 6px; 
            font-family: 'SF Mono', Monaco, monospace; color: #fbbf24; 
            font-size: 0.9em;
        }
        .button { 
            background: #6366f1; color: white; border: none; padding: 14px 28px; 
            border-radius: 10px; text-decoration: none; display: inline-block; 
            margin: 12px; font-weight: 600; transition: all 0.3s; 
            font-size: 1.1em;
        }
        .button:hover { 
            background: #4f46e5; transform: translateY(-2px); 
            box-shadow: 0 10px 25px rgba(99, 102, 241, 0.4);
        }
        ul { text-align: left; max-width: 700px; margin: 0 auto; }
        li { margin: 12px 0; padding: 8px 0; }
        .success { color: #10b981; font-weight: 600; }
        .pending { color: #f59e0b; font-weight: 600; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; }
        .metric { background: #111; padding: 24px; border-radius: 12px; text-align: center; }
        .metric-value { font-size: 2.5rem; font-weight: bold; color: #6366f1; }
        .metric-label { color: #888; margin-top: 8px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="logo">E</div>
    <h1>Echo AI Interface</h1>
    <p style="color: #888; font-size: 1.3rem; margin-bottom: 2rem;">100% Cloudflare Self-Contained Architecture</p>
    
    <div class="status">
        <h2>${env.R2_FRONTEND ? '🎉 Migration Complete!' : '⚙️ Configuration Required'}</h2>
        ${env.R2_FRONTEND ? 
            '<p><strong>SUCCESS:</strong> Zero GitHub dependencies achieved! Frontend served entirely from R2.</p>' :
            '<p><strong>PENDING:</strong> R2 frontend binding required to complete migration.</p>'
        }
        
        <div class="grid">
            <div class="metric">
                <div class="metric-value">${env.R2_FRONTEND ? '0' : '1'}</div>
                <div class="metric-label">GitHub Dependencies</div>
            </div>
            <div class="metric">
                <div class="metric-value">100%</div>
                <div class="metric-label">Cloudflare Architecture</div>
            </div>
            <div class="metric">
                <div class="metric-value">9</div>
                <div class="metric-label">AI Tools Available</div>
            </div>
        </div>
        
        <h2>🏗️ Architecture Status</h2>
        <ul>
            <li class="success">✅ Worker deployed with R2 + GitHub MCP tools</li>
            <li class="success">✅ Frontend files uploaded to R2 storage</li>
            <li class="success">✅ GitHub fallback removed from code</li>
            <li class="${env.R2_FRONTEND ? 'success' : 'pending'}">
                ${env.R2_FRONTEND ? '✅' : '⚙️'} R2_FRONTEND binding ${env.R2_FRONTEND ? 'configured' : 'required'}
            </li>
        </ul>
        
        ${!env.R2_FRONTEND ? `
        <h2>📋 Required Bindings</h2>
        <ul>
            <li><code>R2_FRONTEND</code> → <code>echo-frontend</code> bucket</li>
            <li><code>R2_MESSAGES</code> → <code>echo-messages</code> bucket</li>
            <li><code>R2_CONVERSATIONS</code> → <code>echo-conversations</code> bucket</li>
            <li><code>SESSIONS</code> → KV namespace for session storage</li>
        </ul>
        ` : ''}
        
        <p style="margin-top: 2rem;">
            <a href="/api/health" class="button">🔍 Check System Health</a>
            <a href="/api/projects" class="button">📁 View Project Status</a>
        </p>
    </div>
    
    <div style="margin-top: 4rem; color: #666; font-size: 0.95em; border-top: 1px solid #333; padding-top: 2rem;">
        <strong>Achievement Unlocked:</strong> 100% Cloudflare Migration ${env.R2_FRONTEND ? 'Complete' : 'In Progress'}<br>
        <strong>Architecture:</strong> Worker → R2 Storage → GitHub MCP Tools (repo operations only)<br>
        <strong>Status:</strong> Zero GitHub file dependencies • Full R2 frontend serving<br>
        <strong>Cost:</strong> ~$0.50-1.00/month with gpt-4.1-nano
    </div>
</body>
</html>`, {
      headers: { 'Content-Type': 'text/html' },
      status: env.R2_FRONTEND ? 200 : 503
    });
  }
};

function generateSessionId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
}

function generateMessageId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `msg_${timestamp}_${randomStr}`;
}

async function executeR2Tool(env, toolName, args) {
  switch (toolName) {
    case 'save_message':
      return await saveMessageToR2(env.R2_MESSAGES, args);
    case 'get_messages':
      return await getMessagesFromR2(env.R2_MESSAGES, args);
    case 'save_conversation_summary':
      return await saveConversationSummary(env.R2_CONVERSATIONS, args);
    case 'create_task':
      return await createTask(env.R2_MESSAGES, args);
    default:
      throw new Error(`Unknown R2 tool: ${toolName}`);
  }
}

async function saveMessageToR2(bucket, data) {
  if (!bucket) {
    return { success: false, error: 'R2 bucket not configured' };
  }

  const { messageId, sessionId, content, userType, metadata = {} } = data;
  
  const messageData = {
    messageId,
    sessionId,
    content,
    userType,
    timestamp: new Date().toISOString(),
    ...metadata
  };
  
  const key = `messages/${sessionId}/${messageId}.json`;
  
  try {
    await bucket.put(key, JSON.stringify(messageData, null, 2), {
      httpMetadata: { contentType: 'application/json' }
    });
    
    return {
      success: true,
      messageId,
      key,
      timestamp: messageData.timestamp
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getMessagesFromR2(bucket, args) {
  if (!bucket) {
    return { error: 'R2 bucket not configured' };
  }

  const { sessionId, limit = 50 } = args;
  
  try {
    const objects = await bucket.list({ prefix: `messages/${sessionId}/`, limit });
    const messages = [];
    
    for (const obj of objects.objects.slice(0, limit)) {
      try {
        const content = await bucket.get(obj.key);
        const messageData = JSON.parse(await content.text());
        messages.push(messageData);
      } catch (error) {
        console.error(`Error reading message ${obj.key}:`, error);
      }
    }
    
    return {
      sessionId,
      messages: messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
      count: messages.length
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function saveConversationSummary(bucket, data) {
  if (!bucket) {
    return { success: false, error: 'R2 bucket not configured' };
  }

  const { sessionId, summary, messageCount, duration, topics = [] } = data;
  
  const summaryData = {
    sessionId,
    summary,
    messageCount,
    duration,
    topics,
    createdAt: new Date().toISOString()
  };
  
  const key = `summaries/${sessionId}_summary.json`;
  
  try {
    await bucket.put(key, JSON.stringify(summaryData, null, 2), {
      httpMetadata: { contentType: 'application/json' }
    });
    
    return {
      success: true,
      sessionId,
      key
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createTask(bucket, data) {
  if (!bucket) {
    return { success: false, error: 'R2 bucket not configured' };
  }

  const { title, description, priority, category, relatedSessionId } = data;
  const taskId = `task_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`;
  
  const taskData = {
    taskId,
    title,
    description,
    priority,
    category,
    relatedSessionId,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  const key = `tasks/pending/${taskId}.json`;
  
  try {
    await bucket.put(key, JSON.stringify(taskData, null, 2), {
      httpMetadata: { contentType: 'application/json' }
    });
    
    return {
      success: true,
      taskId,
      key
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function executeGitHubTool(token, toolName, args) {
  if (!token) {
    return { error: 'GitHub token not configured' };
  }

  const baseHeaders = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Echo-AI-Interface'
  };

  switch (toolName) {
    case 'search_repositories': {
      const query = encodeURIComponent(args.query);
      const perPage = args.perPage || 30;
      const page = args.page || 1;
      
      const response = await fetch(
        `https://api.github.com/search/repositories?q=${query}&per_page=${perPage}&page=${page}`,
        { headers: baseHeaders }
      );
      
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      return await response.json();
    }

    case 'get_file_contents': {
      const { owner, repo, path, branch = 'main' } = args;
      
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
        { headers: baseHeaders }
      );
      
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      return await response.json();
    }

    case 'create_or_update_file': {
      const { owner, repo, path, content, message, branch, sha } = args;
      
      const body = {
        message,
        content: Buffer.from(content).toString('base64'),
        branch
      };
      
      if (sha) body.sha = sha;
      
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          method: 'PUT',
          headers: { ...baseHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        }
      );
      
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      return await response.json();
    }

    case 'create_issue': {
      const { owner, repo, title, body = '', labels = [] } = args;
      
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues`,
        {
          method: 'POST',
          headers: { ...baseHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, body, labels })
        }
      );
      
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      return await response.json();
    }

    case 'list_issues': {
      const { owner, repo, state = 'open', per_page = 30, page = 1 } = args;
      
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}&per_page=${per_page}&page=${page}`,
        { headers: baseHeaders }
      );
      
      if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
      return await response.json();
    }

    default:
      throw new Error(`Unknown GitHub tool: ${toolName}`);
  }
}