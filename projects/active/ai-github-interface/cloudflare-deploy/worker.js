// Simple Cloudflare Worker that bridges to your existing MCP server
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (url.pathname === '/api/health') {
      return new Response(JSON.stringify({ 
        status: 'healthy',
        mcp_server: 'https://github-mcp-remote.metamike.workers.dev',
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Chat endpoint - connects to your MCP server
    if (url.pathname === '/api/chat' && request.method === 'POST') {
      try {
        const { message } = await request.json();
        
        // For now, use GitHub API directly until we sort out MCP auth
        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=5', {
          headers: {
            'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'AI-GitHub-Interface'
          }
        });
        
        if (response.ok) {
          const repos = await response.json();
          return new Response(JSON.stringify({
            response: `Found ${repos.length} repositories:\n` + 
                     repos.map(r => `- ${r.full_name}`).join('\n')
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
      } catch (error) {
        return new Response(JSON.stringify({ 
          error: 'Failed to process request' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not Found', { status: 404 });
  }
};
