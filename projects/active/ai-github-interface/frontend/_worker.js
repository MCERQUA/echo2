// Cloudflare Pages Worker for AI GitHub Interface
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

      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy',
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (url.pathname === '/api/chat' && request.method === 'POST') {
        try {
          const { message } = await request.json();
          
          // Log for debugging
          console.log('Received message:', message);
          console.log('GitHub token exists:', !!env.GITHUB_TOKEN);
          
          // Check for repository listing request
          if (message.toLowerCase().includes('list') && message.toLowerCase().includes('repositories')) {
            if (!env.GITHUB_TOKEN) {
              return new Response(JSON.stringify({
                response: 'GitHub token not configured. Please add GITHUB_TOKEN to your environment variables.'
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
            
            try {
              const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
                headers: {
                  'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
                  'Accept': 'application/vnd.github.v3+json',
                  'User-Agent': 'AI-GitHub-Interface'
                }
              });
              
              if (!response.ok) {
                const error = await response.text();
                return new Response(JSON.stringify({
                  response: `GitHub API error (${response.status}): ${error}`
                }), {
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
              }
              
              const repos = await response.json();
              
              if (repos.length === 0) {
                return new Response(JSON.stringify({
                  response: 'No repositories found. Make sure your GitHub token has the correct permissions.'
                }), {
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
              }
              
              const repoList = repos.map(r => `- ${r.full_name} (${r.private ? 'private' : 'public'})`).join('\n');
              
              return new Response(JSON.stringify({
                response: `Found ${repos.length} repositories:\n\n${repoList}`
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
              
            } catch (error) {
              return new Response(JSON.stringify({
                response: `Error fetching repositories: ${error.message}`
              }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              });
            }
          }
          
          // Default response for other messages
          return new Response(JSON.stringify({
            response: `I can help with: listing repositories, creating issues, and more. What would you like to do?`
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
    }
    
    // Let Pages handle everything else (HTML, JS, CSS)
    return env.ASSETS.fetch(request);
  }
};
