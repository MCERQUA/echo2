// True MCP Implementation for GitHub Tools
// This implements the actual MCP protocol so AI can use tools like Claude does

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

      // MCP Tool Definitions - Same format Claude uses
      const MCP_TOOLS = {
        search_repositories: {
          description: "Search for GitHub repositories",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Search query" },
              perPage: { type: "number", description: "Results per page" },
              page: { type: "number", description: "Page number" }
            },
            required: ["query"]
          }
        },
        get_file_contents: {
          description: "Get contents of a file or directory from GitHub",
          parameters: {
            type: "object",
            properties: {
              owner: { type: "string", description: "Repository owner" },
              repo: { type: "string", description: "Repository name" },
              path: { type: "string", description: "File or directory path" },
              branch: { type: "string", description: "Branch name" }
            },
            required: ["owner", "repo", "path"]
          }
        },
        create_or_update_file: {
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
              sha: { type: "string", description: "SHA of file being replaced" }
            },
            required: ["owner", "repo", "path", "content", "message", "branch"]
          }
        },
        create_issue: {
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
      };

      // List available tools
      if (url.pathname === '/api/mcp/tools') {
        return new Response(JSON.stringify({
          tools: MCP_TOOLS
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Execute MCP tool calls - This is what makes it real MCP!
      if (url.pathname === '/api/mcp/execute' && request.method === 'POST') {
        try {
          const { tool, parameters } = await request.json();
          
          if (!env.GITHUB_TOKEN) {
            return new Response(JSON.stringify({
              error: 'GitHub token not configured'
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // Execute the requested tool
          let result;
          switch (tool) {
            case 'search_repositories':
              result = await searchRepositories(env.GITHUB_TOKEN, parameters);
              break;
            
            case 'get_file_contents':
              result = await getFileContents(env.GITHUB_TOKEN, parameters);
              break;
            
            case 'create_or_update_file':
              result = await createOrUpdateFile(env.GITHUB_TOKEN, parameters);
              break;
            
            case 'create_issue':
              result = await createIssue(env.GITHUB_TOKEN, parameters);
              break;
            
            default:
              return new Response(JSON.stringify({
                error: `Unknown tool: ${tool}`
              }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
          }

          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });

        } catch (error) {
          console.error('MCP execution error:', error);
          return new Response(JSON.stringify({
            error: error.message
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Claude-compatible chat endpoint that processes MCP tool calls
      if (url.pathname === '/api/chat' && request.method === 'POST') {
        try {
          const { messages } = await request.json();
          
          // This is where you'd integrate with Claude API instead of Groq
          // Claude understands MCP tools and will generate proper tool calls
          
          if (!env.ANTHROPIC_API_KEY) {
            return new Response(JSON.stringify({
              error: 'To use MCP tools, you need Claude API (ANTHROPIC_API_KEY)'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          // Send to Claude with tool definitions
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              model: 'claude-3-haiku-20240307', // or claude-3-sonnet/opus
              messages: messages,
              tools: Object.entries(MCP_TOOLS).map(([name, def]) => ({
                name,
                description: def.description,
                input_schema: def.parameters
              })),
              max_tokens: 4096
            })
          });

          const claudeResponse = await response.json();
          
          // Process any tool calls Claude wants to make
          if (claudeResponse.content?.some(c => c.type === 'tool_use')) {
            const toolCalls = claudeResponse.content.filter(c => c.type === 'tool_use');
            const toolResults = [];
            
            for (const toolCall of toolCalls) {
              const result = await executeTool(env.GITHUB_TOKEN, toolCall.name, toolCall.input);
              toolResults.push({
                tool_use_id: toolCall.id,
                content: JSON.stringify(result)
              });
            }
            
            // Send tool results back to Claude
            const finalResponse = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'x-api-key': env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
              },
              body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                messages: [
                  ...messages,
                  claudeResponse,
                  { role: 'user', content: toolResults }
                ],
                max_tokens: 4096
              })
            });
            
            return new Response(JSON.stringify(await finalResponse.json()), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }

          return new Response(JSON.stringify(claudeResponse), {
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
    }
    
    return env.ASSETS.fetch(request);
  }
};

// Tool implementations
async function searchRepositories(token, params) {
  const query = encodeURIComponent(params.query);
  const perPage = params.perPage || 30;
  const page = params.page || 1;
  
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${query}&per_page=${perPage}&page=${page}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCP-Server'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  return await response.json();
}

async function getFileContents(token, params) {
  const { owner, repo, path, branch = 'main' } = params;
  
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCP-Server'
      }
    }
  );
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  return await response.json();
}

async function createOrUpdateFile(token, params) {
  const { owner, repo, path, content, message, branch, sha } = params;
  
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch
  };
  
  if (sha) {
    body.sha = sha;
  }
  
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCP-Server',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  return await response.json();
}

async function createIssue(token, params) {
  const { owner, repo, title, body = '', labels = [] } = params;
  
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MCP-Server',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, body, labels })
    }
  );
  
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  
  return await response.json();
}

async function executeTool(token, toolName, parameters) {
  switch (toolName) {
    case 'search_repositories':
      return await searchRepositories(token, parameters);
    case 'get_file_contents':
      return await getFileContents(token, parameters);
    case 'create_or_update_file':
      return await createOrUpdateFile(token, parameters);
    case 'create_issue':
      return await createIssue(token, parameters);
    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
