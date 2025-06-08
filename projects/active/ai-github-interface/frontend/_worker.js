// Echo AI Interface - Fully Self-Contained R2 Architecture
// Updated for echo2.pages.dev with complete R2 migration
// Serves frontend from R2 + GitHub MCP tools + R2 storage

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

      // Initialize KV namespace for session storage
      const SESSIONS = env.SESSIONS || env.KV;

      // Combined Tool Definitions - GitHub + R2 Storage
      const ECHO_TOOLS = [
        // GitHub Tools
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
        // R2 Storage Tools for Echo Messages
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

      // Health check - updated to show R2 frontend status
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy',
          model: 'OpenAI gpt-4.1-nano',
          storage: 'Cloudflare R2',
          frontend: env.R2_FRONTEND ? 'R2 Self-Contained' : 'GitHub Fallback',
          deployment: 'echo2.pages.dev',
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
          github_dependency: env.R2_FRONTEND ? 'MCP tools only' : 'MCP tools + frontend fallback',
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Main chat endpoint with OpenAI and R2 integration
      if (url.pathname === '/api/chat' && request.method === 'POST') {
        try {
          const { message, sessionId, stream = false } = await request.json();
          
          if (!env.OPENAI_API_KEY) {
            return new Response(JSON.stringify({
              error: 'OpenAI API key not configured. Add OPENAI_API_KEY to environment variables.'
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // Get or create session
          let session = { messages: [] };
          if (sessionId && SESSIONS) {
            const sessionData = await SESSIONS.get(`session:${sessionId}`);
            if (sessionData) {
              session = JSON.parse(sessionData);
            }
          }

          // Generate unique message ID
          const messageId = generateMessageId();

          // Auto-save user message to R2 storage (if available)
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
              console.log('R2 save failed (graceful degradation):', error.message);
            }
          }

          // Add user message to session
          const userMessage = { role: 'user', content: message };
          session.messages.push(userMessage);

          // Prepare messages for OpenAI
          const systemMessage = {
            role: 'system',
            content: `You are Echo's AI Assistant with GitHub tools and R2 storage.

CAPABILITIES:
- GitHub: Search repos, read/write files, manage issues  
- R2 Storage: Save messages, conversations, create tasks for Echo (if configured)
- Session Management: Maintain conversation context
- Frontend: ${env.R2_FRONTEND ? 'Served from R2 (fully self-contained)' : 'GitHub fallback mode'}

BEHAVIOR:
- Use GitHub tools for code/repository operations
- Use R2 storage tools to save important conversations or create tasks (when available)
- Maintain context from previous messages in this session
- Be helpful and concise
- Always respond in English

STORAGE GUIDANCE:
- If R2 is available, auto-save important conversations using save_conversation_summary
- Create tasks for Echo using create_task when users request follow-up
- Save messages with save_message for persistence beyond session expiry

MIGRATION STATUS:
- R2 Frontend: ${env.R2_FRONTEND ? 'Active' : 'Pending - using GitHub fallback'}
- R2 Storage: ${env.R2_MESSAGES ? 'Active' : 'Not configured'}
- System: Hybrid GitHub/R2 architecture`
          };

          // Limit conversation history to avoid token limits
          const recentMessages = session.messages.slice(-20);
          const openAIMessages = [systemMessage, ...recentMessages];

          // Call OpenAI with tools
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

          // Handle tool calls
          if (aiMessage.tool_calls) {
            const toolResults = [];
            
            for (const toolCall of aiMessage.tool_calls) {
              try {
                let result;
                const toolName = toolCall.function.name;
                const args = JSON.parse(toolCall.function.arguments);
                
                // Route to appropriate tool handler
                if (['save_message', 'get_messages', 'save_conversation_summary', 'create_task'].includes(toolName)) {
                  // R2 Storage tools
                  result = await executeR2Tool(env, toolName, args);
                } else {
                  // GitHub tools
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

            // Get final response with tool results
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
            
            // Auto-save assistant response to R2 (if available)
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
                console.log('R2 save failed (graceful degradation):', error.message);
              }
            }
            
            // Add messages to session
            session.messages.push(aiMessage);
            toolResults.forEach(result => session.messages.push(result));
            session.messages.push(finalMessage);
            
            // Calculate cost
            const totalTokens = (data.usage?.total_tokens || 0) + (finalData.usage?.total_tokens || 0);
            const estimatedCost = (totalTokens / 1000000) * 0.50;
            
            // Save session
            if (sessionId && SESSIONS) {
              await SESSIONS.put(`session:${sessionId}`, JSON.stringify(session), {
                expirationTtl: 86400
              });
            }
            
            return new Response(JSON.stringify({
              response: finalMessage.content,
              sessionId: sessionId || 'ephemeral',
              messageId,
              storage: env.R2_MESSAGES ? 'R2 active' : 'R2 not configured',
              frontend: env.R2_FRONTEND ? 'R2 self-contained' : 'GitHub fallback',
              usage: {
                ...finalData.usage,
                total_tokens: totalTokens,
                estimated_cost: `$${estimatedCost.toFixed(6)}`
              }
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // No tool calls - save response and return
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
              console.log('R2 save failed (graceful degradation):', error.message);
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
            storage: env.R2_MESSAGES ? 'R2 active' : 'R2 not configured',
            frontend: env.R2_FRONTEND ? 'R2 self-contained' : 'GitHub fallback',
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

      // Session management endpoints
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

      // Tools endpoint
      if (url.pathname === '/api/mcp/tools') {
        return new Response(JSON.stringify({
          tools: ECHO_TOOLS.map(t => ({
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters
          }))
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Projects endpoint
      if (url.pathname === '/api/projects' && request.method === 'GET') {
        const projects = {
          projects: [
            {
              name: "echo-ai-interface",
              description: "Self-contained AI interface with R2 storage",
              category: "Interface",
              status: env.R2_FRONTEND ? "fully-migrated" : "migration-pending"
            },
            {
              name: "r2-storage-system",
              description: "10GB message and conversation persistence",
              category: "Storage",
              status: env.R2_MESSAGES ? "active" : "pending"
            },
            {
              name: "github-mcp-tools",
              description: "Repository operations and code management",
              category: "Integration",
              status: "active"
            }
          ]
        };
        
        return new Response(JSON.stringify(projects), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // NEW: Serve frontend files from R2 storage if available
    if (env.R2_FRONTEND) {
      try {
        // Determine file path
        let filePath = url.pathname === '/' ? 'frontend/index.html' : `frontend${url.pathname}`;
        
        // Get file from R2
        const object = await env.R2_FRONTEND.get(filePath);
        
        if (object) {
          const headers = new Headers();
          
          // Set content type based on file extension
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
          
          // Add caching headers
          headers.set('Cache-Control', 'public, max-age=3600');
          headers.set('ETag', object.etag);
          
          return new Response(object.body, { headers });
        }
      } catch (error) {
        console.error('R2 frontend error:', error);
        // Fall through to GitHub serving
      }
    }
    
    // Fallback to GitHub serving if R2 not available or file not found
    return env.ASSETS.fetch(request);
  }
};

// Helper functions
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

// R2 Storage Tool Implementations
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
    return { success: false, error: 'R2 bucket not configured - add R2_MESSAGES binding' };
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
  const messageContent = JSON.stringify(messageData, null, 2);
  
  try {
    await bucket.put(key, messageContent, {
      httpMetadata: { contentType: 'application/json' }
    });
    
    return {
      success: true,
      messageId,
      key,
      size: messageContent.length,
      timestamp: messageData.timestamp
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function getMessagesFromR2(bucket, args) {
  if (!bucket) {
    return { error: 'R2 bucket not configured - add R2_MESSAGES binding' };
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
    return { success: false, error: 'R2 bucket not configured - add R2_CONVERSATIONS binding' };
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
      key,
      summary: summaryData
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createTask(bucket, data) {
  if (!bucket) {
    return { success: false, error: 'R2 bucket not configured - add R2_MESSAGES binding' };
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
      key,
      task: taskData
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// GitHub Tool Implementations
async function executeGitHubTool(token, toolName, args) {
  if (!token) {
    return { error: 'GitHub token not configured - add GITHUB_TOKEN environment variable' };
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
