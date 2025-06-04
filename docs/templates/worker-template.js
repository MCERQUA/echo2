/**
 * Cloudflare Pages Worker Template for Remote MCP Server
 * 
 * This is a complete, working template that can be copied and modified
 * for any project needing GitHub integration without local MCP tools.
 * 
 * Instructions:
 * 1. Copy this file as _worker.js in your project's root directory
 * 2. Deploy to Cloudflare Pages
 * 3. Add GITHUB_TOKEN environment variable in Cloudflare dashboard
 * 4. Test with /api/health endpoint
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Handle API routes
    if (url.pathname.startsWith('/api/')) {
      // CORS headers for API endpoints
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      };

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Health check endpoint - always implement this first
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy',
          timestamp: new Date().toISOString(),
          hasToken: !!env.GITHUB_TOKEN
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Main operations endpoint
      if (url.pathname === '/api/github' && request.method === 'POST') {
        try {
          const { operation, data } = await request.json();
          
          // Check for GitHub token
          if (!env.GITHUB_TOKEN) {
            return new Response(JSON.stringify({
              error: 'GitHub token not configured',
              message: 'Please add GITHUB_TOKEN to environment variables'
            }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          // Handle different operations
          let result;
          
          switch (operation) {
            case 'list-repos':
              result = await listRepositories(env.GITHUB_TOKEN);
              break;
              
            case 'create-repo':
              result = await createRepository(env.GITHUB_TOKEN, data);
              break;
              
            case 'create-issue':
              result = await createIssue(env.GITHUB_TOKEN, data);
              break;
              
            case 'get-user':
              result = await getUser(env.GITHUB_TOKEN);
              break;
              
            default:
              result = { error: 'Unknown operation', available: ['list-repos', 'create-repo', 'create-issue', 'get-user'] };
          }
          
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
          
        } catch (error) {
          console.error('Operation error:', error);
          return new Response(JSON.stringify({ 
            error: 'Operation failed',
            message: error.message 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Chat endpoint for natural language processing
      if (url.pathname === '/api/chat' && request.method === 'POST') {
        try {
          const { message } = await request.json();
          
          if (!env.GITHUB_TOKEN) {
            return new Response(JSON.stringify({
              response: 'GitHub token not configured. Please add GITHUB_TOKEN to environment variables.'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          // Simple natural language processing
          const lowerMessage = message.toLowerCase();
          
          if (lowerMessage.includes('list') && lowerMessage.includes('repo')) {
            const repos = await listRepositories(env.GITHUB_TOKEN);
            return new Response(JSON.stringify({
              response: repos.error ? `Error: ${repos.error}` : `Found ${repos.count} repositories:\n\n${repos.list}`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          if (lowerMessage.includes('who am i') || lowerMessage.includes('user info')) {
            const user = await getUser(env.GITHUB_TOKEN);
            return new Response(JSON.stringify({
              response: user.error ? `Error: ${user.error}` : `You are ${user.name} (@${user.login}) with ${user.public_repos} public repos.`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          // Default response
          return new Response(JSON.stringify({
            response: 'I can help you with GitHub operations. Try asking me to:\n- List repositories\n- Get user info\n- Create issues\n- Create repositories'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
          
        } catch (error) {
          console.error('Chat error:', error);
          return new Response(JSON.stringify({ 
            response: 'Sorry, I encountered an error processing your request.' 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // 404 for unknown API routes
      return new Response(JSON.stringify({ error: 'API route not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // For non-API routes, serve static files from Cloudflare Pages
    return env.ASSETS.fetch(request);
  }
};

// GitHub API helper functions
async function githubRequest(token, endpoint, options = {}) {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Cloudflare-Worker',
      ...options.headers
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${error}`);
  }
  
  return response.json();
}

async function listRepositories(token) {
  try {
    const repos = await githubRequest(token, '/user/repos?sort=updated&per_page=10');
    return {
      count: repos.length,
      list: repos.map(r => `- ${r.full_name} (${r.private ? 'private' : 'public'})`).join('\n'),
      repos: repos.map(r => ({
        name: r.name,
        full_name: r.full_name,
        private: r.private,
        url: r.html_url
      }))
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function createRepository(token, data) {
  try {
    const { name, description = '', private: isPrivate = false } = data;
    
    if (!name) {
      return { error: 'Repository name is required' };
    }
    
    const repo = await githubRequest(token, '/user/repos', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description,
        private: isPrivate,
        auto_init: true
      })
    });
    
    return {
      success: true,
      name: repo.name,
      full_name: repo.full_name,
      url: repo.html_url
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function createIssue(token, data) {
  try {
    const { owner, repo, title, body = '' } = data;
    
    if (!owner || !repo || !title) {
      return { error: 'Owner, repo, and title are required' };
    }
    
    const issue = await githubRequest(token, `/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      body: JSON.stringify({ title, body })
    });
    
    return {
      success: true,
      number: issue.number,
      title: issue.title,
      url: issue.html_url
    };
  } catch (error) {
    return { error: error.message };
  }
}

async function getUser(token) {
  try {
    const user = await githubRequest(token, '/user');
    return {
      login: user.login,
      name: user.name || user.login,
      email: user.email,
      public_repos: user.public_repos,
      followers: user.followers,
      following: user.following
    };
  } catch (error) {
    return { error: error.message };
  }
}
