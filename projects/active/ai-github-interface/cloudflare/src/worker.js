export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route handling
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ 
        status: 'healthy',
        mcp_server: env.MCP_SERVER_URL,
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { message } = await request.json();
        
        // Connect to MCP server using internal Cloudflare communication
        const response = await handleMCPRequest(message, env);
        
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: error.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};

// Handle MCP communication
async function handleMCPRequest(message, env) {
  try {
    // First, let's try a simple GitHub API call to test
    if (message.toLowerCase().includes('list my repositories')) {
      const response = await fetch('https://api.github.com/user/repos', {
        headers: {
          'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'AI-GitHub-Interface'
        }
      });
      
      if (response.ok) {
        const repos = await response.json();
        return {
          response: `Found ${repos.length} repositories. Here are the first 5:\n` +
            repos.slice(0, 5).map(r => `- ${r.full_name}`).join('\n')
        };
      }
    }
    
    // For MCP server communication (when OAuth is set up)
    const mcpResponse = await fetch(`${env.MCP_SERVER_URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.MCP_ACCESS_TOKEN || env.GITHUB_TOKEN}`
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'completion',
        params: {
          messages: [{
            role: 'user',
            content: message
          }]
        },
        id: Date.now()
      })
    });
    
    if (mcpResponse.ok) {
      const data = await mcpResponse.json();
      return { response: data.result || 'No response from MCP server' };
    }
    
    // Fallback to direct GitHub operations
    return { response: `I'll help you with: ${message}` };
    
  } catch (error) {
    console.error('MCP Request error:', error);
    return { 
      response: 'Currently using direct GitHub API. How can I help with your repositories?' 
    };
  }
}