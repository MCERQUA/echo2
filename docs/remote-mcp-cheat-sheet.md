# Remote MCP Server Quick Implementation Cheat Sheet

## 🚀 5-Minute Setup

### 1. Create Project Structure
```
your-project/
└── frontend/
    ├── _worker.js    # API routes (copy template below)
    ├── index.html    # Your UI
    └── script.js     # Frontend logic
```

### 2. Copy This _worker.js Template
```javascript
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // API Routes
    if (url.pathname.startsWith('/api/')) {
      const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };

      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Health check
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ status: 'healthy' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // GitHub operations
      if (url.pathname === '/api/github' && request.method === 'POST') {
        try {
          const { action, data } = await request.json();
          
          if (!env.GITHUB_TOKEN) {
            throw new Error('GitHub token not configured');
          }
          
          // Add your GitHub API calls here
          let result = { message: 'Operation completed' };
          
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
          
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Operation failed' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }
    
    // Serve static files
    return env.ASSETS.fetch(request);
  }
};
```

### 3. Deploy to Cloudflare Pages
1. Push to GitHub
2. Connect repo to Cloudflare Pages
3. Build settings:
   - Framework: None
   - Build command: (empty)
   - Output directory: `frontend`
4. Add environment variable: `GITHUB_TOKEN`

### 4. Test
```bash
curl https://your-app.pages.dev/api/health
```

## ✅ What Works
- Cloudflare Pages + _worker.js
- GitHub Personal Access Token
- Simple HTTP requests
- Direct GitHub API v3

## ❌ What Doesn't Work
- SSE/WebSockets in serverless
- MCP OAuth tokens
- Netlify Functions (complex)
- Persistent connections

## 🔑 Remember
- File MUST be named `_worker.js`
- Use GitHub PAT, not MCP tokens
- Check Cloudflare Functions logs
- Start with /api/health endpoint

## 📚 Full Guide
See: `/docs/remote-mcp-server-implementation-guide.md`