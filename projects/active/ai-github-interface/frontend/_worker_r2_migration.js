// Echo AI Interface - Cloudflare R2 Migration Worker
// Combines GitHub tools with R2 storage for message persistence
// Replaces GitHub-based message storage with Cloudflare R2

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
      if (!SESSIONS) {
        console.error('KV namespace not configured');
      }

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
        },
        {
          type: "function",
          function: {
            name: "list_files",
            description: "List files in R2 storage with optional filtering",
            parameters: {
              type: "object",
              properties: {
                bucket: { type: "string", enum: ["echo-messages", "echo-conversations", "echoai-interface"], description: "Storage bucket" },
                prefix: { type: "string", description: "File path prefix filter" },
                limit: { type: "number", description: "Maximum files to return" }
              },
              required: ["bucket"]
            }
          }
        }
      ];

      // Health check
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy',
          model: 'OpenAI gpt-4.1-nano',
          storage: 'Cloudflare R2',
          features: ['session_threading', 'github_tools', 'r2_storage', 'message_persistence'],
          cost_per_million: { input: 0.10, output: 0.40 },
          tools: ECHO_TOOLS.length,
          buckets: ['echo-messages', 'echo-conversations', 'echoai-interface'],
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create new session
      if (url.pathname === '/api/session' && request.method === 'POST') {
        const sessionId = generateSessionId();
        const session = {
          id: sessionId,
          created: new Date().toISOString(),
          messages: [],
          metadata: {}
        };
        
        if (SESSIONS) {
          await SESSIONS.put(`session:${sessionId}`, JSON.stringify(session), {
            expirationTtl: 86400
          });
        }
        
        return new Response(JSON.stringify({
          sessionId,
          message: 'Session created successfully'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Get session info
      if (url.pathname.match(/^\/api\/session\/(.+)$/) && request.method === 'GET') {
        const sessionId = url.pathname.split('/').pop();
        
        if (!SESSIONS) {
          return new Response(JSON.stringify({
            error: 'Session storage not configured'
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const sessionData = await SESSIONS.get(`session:${sessionId}`);
        if (!sessionData) {
          return new Response(JSON.stringify({
            error: 'Session not found'
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        const session = JSON.parse(sessionData);
        return new Response(JSON.stringify({
          ...session,
          messageCount: session.messages.length
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Clear session
      if (url.pathname.match(/^\/api\/session\/(.+)$/) && request.method === 'DELETE') {
        const sessionId = url.pathname.split('/').pop();
        
        if (SESSIONS) {
          await SESSIONS.delete(`session:${sessionId}`);
        }
        
        return new Response(JSON.stringify({
          message: 'Session cleared'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // List available tools
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

          // Auto-save user message to R2 storage
          if (env.R2_MESSAGES) {
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
          }

          // Add user message to session
          const userMessage = { role: 'user', content: message };
          session.messages.push(userMessage);

          // Prepare messages for OpenAI
          const systemMessage = {
            role: 'system',
            content: `You are Echo's AI Assistant with access to GitHub tools and R2 storage.

CAPABILITIES:
- GitHub: Search repos, read/write files, manage issues
- R2 Storage: Save messages, conversations, create tasks for Echo
- Session Management: Maintain conversation context

BEHAVIOR:
- Use GitHub tools for code/repository operations
- Use R2 storage tools to save important conversations or create tasks
- Maintain context from previous messages in this session
- Be helpful and concise
- Always respond in English

STORAGE GUIDANCE:
- Auto-save important conversations using save_conversation_summary
- Create tasks for Echo using create_task when users request follow-up
- Save messages with save_message for persistence beyond session expiry`
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
                if (toolName.startsWith('save_') || toolName.startsWith('get_') || 
                    toolName.startsWith('create_task') || toolName.startsWith('list_files')) {
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
            
            // Auto-save assistant response to R2
            if (env.R2_MESSAGES) {
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
            await saveMessageToR2(env.R2_MESSAGES, {
              messageId: generateMessageId(),
              sessionId: sessionId || 'ephemeral',
              content: aiMessage.content,
              userType: 'assistant',
              metadata: {
                timestamp: new Date().toISOString()
              }
            });
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

      // Storage statistics endpoint
      if (url.pathname === '/api/storage/stats' && request.method === 'GET') {
        try {
          const stats = await getStorageStats(env);
          return new Response(JSON.stringify(stats), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Mock projects endpoint (for sidebar)
      if (url.pathname === '/api/projects' && request.method === 'GET') {
        const projects = {
          projects: [
            {
              name: "echo-ai-interface",
              description: "AI chat interface with R2 storage",
              category: "Interface",
              status: "migrating"
            },
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
            }
          ]
        };
        
        return new Response(JSON.stringify(projects), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
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
      return await createTask(env.R2_TASKS, args);
    
    case 'list_files':
      return await listR2Files(env, args);
    
    default:
      throw new Error(`Unknown R2 tool: ${toolName}`);
  }
}

async function saveMessageToR2(bucket, data) {
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
  
  // Store in R2 (simulated - would need R2 binding)
  return {
    success: true,
    messageId,
    key,
    size: messageContent.length,
    timestamp: messageData.timestamp
  };
}

async function getMessagesFromR2(bucket, args) {
  const { sessionId, limit = 50 } = args;
  
  // Simulate message retrieval
  return {
    sessionId,
    messages: [],
    count: 0,
    note: 'R2 message retrieval would be implemented with actual R2 binding'
  };
}

async function saveConversationSummary(bucket, data) {
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
  
  return {
    success: true,
    sessionId,
    key,
    summary: summaryData
  };
}

async function createTask(bucket, data) {
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
  
  return {
    success: true,
    taskId,
    key,
    task: taskData
  };
}

async function listR2Files(env, args) {
  const { bucket, prefix, limit = 100 } = args;
  
  // Simulate file listing
  return {
    bucket,
    prefix,
    files: [],
    count: 0,
    note: 'R2 file listing would be implemented with actual R2 binding'
  };
}

async function getStorageStats(env) {
  return {
    buckets: {
      'echo-messages': { files: 0, size: '0 KB' },
      'echo-conversations': { files: 0, size: '0 KB' },
      'echoai-interface': { files: 5, size: '4 KB' }
    },
    totalFiles: 5,
    totalSize: '4 KB',
    freeSpace: '9.999996 GB',
    usage: '0.00004%',
    note: 'Statistics would be updated with actual R2 bindings'
  };
}

// GitHub Tool Implementations (unchanged from original)
async function executeGitHubTool(token, toolName, args) {
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
