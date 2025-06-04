// This file makes Cloudflare Pages handle API routes too!
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
          
          // Use GitHub API directly
          if (message.toLowerCase().includes('list my repositories')) {
            const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=5', {
              headers: {
                'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
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
          }
          
          return new Response(JSON.stringify({
            response: `I can help with: listing repositories, creating issues, and more. What would you like to do?`
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
          
        } catch (error) {
          return new Response(JSON.stringify({ 
            error: 'Failed to process request' 
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
