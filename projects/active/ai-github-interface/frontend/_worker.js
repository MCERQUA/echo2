// OpenAI MCP Implementation with Session Threading
// Uses OpenAI's gpt-4.1-nano with conversation persistence

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

      // MCP Tool Definitions - OpenAI format
      const OPENAI_TOOLS = [
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
        }
      ];

      // Health check
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy',
          model: 'OpenAI gpt-4.1-nano',
          features: ['session_threading', 'github_tools', 'conversation_persistence'],
          cost_per_million: { input: 0.10, output: 0.40 },
          tools: OPENAI_TOOLS.length,
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
          // Store session for 24 hours
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
          tools: OPENAI_TOOLS.map(t => ({
            name: t.function.name,
            description: t.function.description,
            parameters: t.function.parameters
          }))
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Main chat endpoint with OpenAI and session threading
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

          if (!env.GITHUB_TOKEN) {
            return new Response(JSON.stringify({
              error: 'GitHub token not configured. Add GITHUB_TOKEN to environment variables.'
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

          // Add user message to session
          const userMessage = { role: 'user', content: message };
          session.messages.push(userMessage);

          // Prepare messages for OpenAI (include system prompt + conversation history)
          const systemMessage = {
            role: 'system',
            content: `You are Echo's AI Assistant with access to GitHub tools.
You can search repositories, read files, create issues, and more.
When users ask about GitHub operations, use the appropriate tools.
Remember previous messages in this conversation to maintain context.
Be helpful and concise in your responses.
IMPORTANT: Always respond in English, regardless of the input language.`
          };

          // Limit conversation history to last 20 messages to avoid token limits
          const recentMessages = session.messages.slice(-20);
          const openAIMessages = [systemMessage, ...recentMessages];

          // Call OpenAI with tools using gpt-4.1-nano
          const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4.1-nano-2025-04-14', // Ultra cost-effective model
              messages: openAIMessages,
              tools: OPENAI_TOOLS,
              tool_choice: 'auto', // Let OpenAI decide when to use tools
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

          // Check if OpenAI wants to use tools
          if (aiMessage.tool_calls) {
            const toolResults = [];
            
            // Execute each tool call
            for (const toolCall of aiMessage.tool_calls) {
              try {
                const result = await executeGitHubTool(
                  env.GITHUB_TOKEN, 
                  toolCall.function.name, 
                  JSON.parse(toolCall.function.arguments)
                );
                
                toolResults.push({
                  tool_call_id: toolCall.id,
                  role: 'tool',
                  name: toolCall.function.name,
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

            // Get final response from OpenAI with tool results
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
            
            // Add AI response to session (include tool calls for context)
            session.messages.push(aiMessage);
            toolResults.forEach(result => session.messages.push(result));
            session.messages.push(finalMessage);
            
            // Calculate cost estimate
            const totalTokens = (data.usage?.total_tokens || 0) + (finalData.usage?.total_tokens || 0);
            const estimatedCost = (totalTokens / 1000000) * 0.50; // Rough estimate
            
            // Save updated session
            if (sessionId && SESSIONS) {
              await SESSIONS.put(`session:${sessionId}`, JSON.stringify(session), {
                expirationTtl: 86400 // 24 hours
              });
            }
            
            return new Response(JSON.stringify({
              response: finalMessage.content,
              sessionId: sessionId || 'ephemeral',
              usage: {
                ...finalData.usage,
                total_tokens: totalTokens,
                estimated_cost: `$${estimatedCost.toFixed(6)}`
              }
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // Add AI response to session (no tool calls)
          session.messages.push(aiMessage);
          
          // Save updated session
          if (sessionId && SESSIONS) {
            await SESSIONS.put(`session:${sessionId}`, JSON.stringify(session), {
              expirationTtl: 86400 // 24 hours
            });
          }

          // Return response without tool calls
          const estimatedCost = ((data.usage?.total_tokens || 0) / 1000000) * 0.50;
          
          return new Response(JSON.stringify({
            response: aiMessage.content,
            sessionId: sessionId || 'ephemeral',
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

      // Cost estimation endpoint
      if (url.pathname === '/api/cost-estimate' && request.method === 'GET') {
        const monthlyEstimate = {
          model: 'gpt-4.1-nano',
          pricing: {
            input_per_million: 0.10,
            output_per_million: 0.40,
            cached_input_per_million: 0.025
          },
          typical_usage: {
            tokens_per_month: 2000000,
            estimated_cost: '$0.50 - $1.00'
          },
          comparison: {
            'gpt-3.5-turbo': '$3.00 - $5.00',
            'gpt-4.1-nano': '$0.50 - $1.00',
            'claude-3-haiku': '$2.00 - $4.00'
          }
        };
        
        return new Response(JSON.stringify(monthlyEstimate), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Mock projects endpoint (for sidebar)
      if (url.pathname === '/api/projects' && request.method === 'GET') {
        const projects = {
          projects: [
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
              name: "OpenPacketFix",
              description: "Network protocol optimization",
              category: "Infrastructure",
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

// Generate a unique session ID
function generateSessionId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
}

// GitHub tool implementations
async function executeGitHubTool(token, toolName, args) {
  const baseHeaders = {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'OpenAI-MCP-Server'
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
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
