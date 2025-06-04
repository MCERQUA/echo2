# Remote MCP Server Implementation Guide
*Complete documentation for implementing the remote MCP server in websites and applications*

## 🎯 Executive Summary

The remote MCP server provides a way to integrate GitHub operations into any website without requiring local MCP tools. After many sessions of troubleshooting, we successfully deployed a working implementation at https://echo2.pages.dev using Cloudflare Pages with a custom _worker.js file that directly uses GitHub's API.

**Key Learning**: The simplest solution that actually works is to bypass the MCP OAuth flow entirely and use a GitHub Personal Access Token directly in the serverless environment.

## 🔑 Critical Success Factors

### What Actually Works
1. **Cloudflare Pages** with _worker.js for API routes
2. **GitHub Personal Access Token** (not MCP OAuth tokens)
3. **Direct GitHub API calls** (not SSE-based MCP connections)
4. **Simple JSON-RPC** over HTTP (not WebSocket/SSE)

### What Doesn't Work
1. ❌ Server-Sent Events (SSE) in serverless functions
2. ❌ MCP OAuth tokens for GitHub operations
3. ❌ Netlify Functions (complex deployment issues)
4. ❌ Trying to maintain persistent connections in serverless

## 📋 Prerequisites

Before implementing:
1. GitHub Personal Access Token with appropriate scopes
2. Cloudflare account (free tier works)
3. Basic understanding of serverless functions
4. Your GitHub repository for deployment

## 🚀 Step-by-Step Implementation

### Step 1: Project Structure
```
your-project/
├── frontend/
│   ├── _worker.js      # Cloudflare Pages API routes
│   ├── index.html      # Main interface
│   ├── chat.js         # Frontend logic
│   └── [other assets]
└── README.md
```

### Step 2: Create the Worker File (_worker.js)

```javascript
// frontend/_worker.js
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

      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
      }

      // Health check endpoint
      if (url.pathname === '/api/health') {
        return new Response(JSON.stringify({ 
          status: 'healthy',
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Main chat/operation endpoint
      if (url.pathname === '/api/chat' && request.method === 'POST') {
        try {
          const { message } = await request.json();
          
          // CRITICAL: Check for GitHub token
          if (!env.GITHUB_TOKEN) {
            return new Response(JSON.stringify({
              response: 'GitHub token not configured. Please add GITHUB_TOKEN to environment variables.'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          // Example: List repositories
          if (message.toLowerCase().includes('list') && message.toLowerCase().includes('repositories')) {
            const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
              headers: {
                'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Your-App-Name'
              }
            });
            
            if (!response.ok) {
              throw new Error(`GitHub API error: ${response.status}`);
            }
            
            const repos = await response.json();
            const repoList = repos.map(r => `- ${r.full_name}`).join('\n');
            
            return new Response(JSON.stringify({
              response: `Found ${repos.length} repositories:\n\n${repoList}`
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
          
          // Add more operations here
          
          // Default response
          return new Response(JSON.stringify({
            response: 'I can help with: listing repositories, creating issues, and more.'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
          
        } catch (error) {
          console.error('Error:', error);
          return new Response(JSON.stringify({ 
            error: 'Server error occurred' 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }
    
    // Let Cloudflare Pages handle static files
    return env.ASSETS.fetch(request);
  }
};
```

### Step 3: Frontend Implementation

```javascript
// frontend/chat.js
async function sendMessage(message) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            console.error('Error:', data.error);
        } else {
            console.log('Response:', data.response);
        }
        
    } catch (error) {
        console.error('Request failed:', error);
    }
}
```

### Step 4: Deploy to Cloudflare Pages

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add MCP server implementation"
   git push origin main
   ```

2. **Connect to Cloudflare Pages**:
   - Go to Cloudflare Dashboard > Pages
   - Create new project
   - Connect GitHub repository
   - Build settings:
     - Framework preset: None
     - Build command: (leave empty)
     - Build output directory: `frontend`

3. **Add Environment Variable**:
   - Go to Settings > Environment variables
   - Add `GITHUB_TOKEN` with your personal access token
   - Deploy

## 🔧 Common Operations Implementation

### Create Repository
```javascript
if (message.includes('create repository')) {
    const repoName = extractRepoName(message); // implement extraction logic
    
    const response = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Your-App-Name'
        },
        body: JSON.stringify({
            name: repoName,
            private: false,
            auto_init: true
        })
    });
}
```

### Create Issue
```javascript
if (message.includes('create issue')) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Your-App-Name'
        },
        body: JSON.stringify({
            title: issueTitle,
            body: issueBody
        })
    });
}
```

## ⚠️ Critical Pitfalls to Avoid

### 1. Don't Use SSE/WebSockets in Serverless
**Problem**: Serverless functions timeout and can't maintain persistent connections
**Solution**: Use simple HTTP request/response patterns

### 2. Don't Confuse Token Types
**Problem**: MCP OAuth tokens (format: `USERNAME.XXXXX...`) don't work for GitHub API
**Solution**: Use GitHub Personal Access Tokens (format: `github_pat_XXXXX...`)

### 3. Don't Use Netlify Functions
**Problem**: Complex deployment, directory structure issues, environment variable problems
**Solution**: Use Cloudflare Pages with _worker.js

### 4. Don't Expose Tokens in Frontend
**Problem**: Security vulnerability if tokens are visible in client-side code
**Solution**: Always use server-side/worker functions to handle tokens

## 🔒 Security Best Practices

1. **Never expose tokens in responses**:
   ```javascript
   // BAD
   return new Response(JSON.stringify({ 
       error: `Token ${env.GITHUB_TOKEN} is invalid` 
   }));
   
   // GOOD
   return new Response(JSON.stringify({ 
       error: 'Authentication failed' 
   }));
   ```

2. **Validate all inputs**:
   ```javascript
   const { message } = await request.json();
   if (!message || typeof message !== 'string' || message.length > 1000) {
       return new Response(JSON.stringify({ 
           error: 'Invalid input' 
       }), { status: 400 });
   }
   ```

3. **Rate limiting** (basic example):
   ```javascript
   // In production, use Cloudflare's rate limiting features
   const clientIP = request.headers.get('CF-Connecting-IP');
   // Implement rate limiting logic
   ```

## 📊 Testing Your Implementation

### 1. Local Testing
Unfortunately, Cloudflare Workers can't be fully tested locally with environment variables. Use wrangler for local development:

```bash
npm install -g wrangler
wrangler pages dev frontend --compatibility-date=2024-01-01
```

### 2. Production Testing
After deployment, test these endpoints:

```bash
# Health check
curl https://your-app.pages.dev/api/health

# Test operation
curl -X POST https://your-app.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "list repositories"}'
```

## 🚦 Debugging Checklist

When things don't work, check:

1. ✅ Is the GITHUB_TOKEN environment variable set in Cloudflare?
2. ✅ Is the _worker.js file in the root of your build directory?
3. ✅ Are you using the correct API endpoints (/api/...)?
4. ✅ Check Cloudflare Pages > Functions > Real-time logs
5. ✅ Verify CORS headers are included in responses
6. ✅ Ensure you're handling both OPTIONS and POST requests

## 📈 Scaling Considerations

### Current Limitations
- Cloudflare Workers: 10ms CPU time per request (free tier)
- 100,000 requests per day (free tier)
- No persistent storage (use external database if needed)

### When to Upgrade
- Need persistent connections → Use dedicated server
- Complex operations → Consider Railway or similar
- High volume → Cloudflare Workers paid plan

## 🎯 Quick Reference Card

```yaml
Platform: Cloudflare Pages
File: frontend/_worker.js
Token: GitHub Personal Access Token (not MCP OAuth)
API: Direct GitHub API v3
Pattern: Simple HTTP request/response
Deployment: Git push → Auto deploy
Environment: Set GITHUB_TOKEN in Cloudflare dashboard
Testing: Use /api/health endpoint first
Debugging: Check Functions logs in Cloudflare
```

## 📝 Summary

The key to successfully implementing the remote MCP server is to:
1. Keep it simple - use direct GitHub API calls
2. Use the right platform - Cloudflare Pages with _worker.js
3. Use the right token - GitHub PAT, not MCP OAuth
4. Avoid complexity - no SSE, no persistent connections
5. Test incrementally - start with health check, then simple operations

This approach has been proven to work at https://echo2.pages.dev and can be replicated for any project needing GitHub integration without local MCP tools.