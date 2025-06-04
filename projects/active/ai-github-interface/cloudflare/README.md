# AI GitHub Interface - Cloudflare Edition

## What's Different?

This is the Cloudflare-optimized version of the AI GitHub Interface that solves the SSE/serverless incompatibility issues we encountered with Netlify.

## Key Improvements

1. **No SSE Limitations**: Cloudflare Workers can handle any protocol
2. **Direct GitHub Integration**: Uses your GitHub PAT directly
3. **Unified Platform**: Frontend and API on same platform
4. **Better Performance**: Edge computing for faster responses
5. **Simpler Architecture**: No complex MCP OAuth flow needed

## Quick Start

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Deploy the API worker:
```bash
cd cloudflare
wrangler deploy
```

3. Deploy frontend to Cloudflare Pages (see DEPLOYMENT_GUIDE.md)

## Architecture

```
User → Cloudflare Pages → Cloudflare Worker → GitHub API
                               ↓
                    (Future: MCP Server Integration)
```

## Features Working Now

- ✅ List repositories
- ✅ Natural language interface
- ✅ No local server required
- ✅ Secure token handling
- ✅ CORS properly configured

## Coming Soon

- Full MCP server integration
- More GitHub operations
- AI-powered code analysis
- Repository insights

## Why This Works Better

The Netlify approach failed because:
- Serverless functions can't maintain SSE connections
- MCP server expects persistent connections
- Complex OAuth flow incompatible with serverless

Cloudflare solves this by:
- Workers can maintain any type of connection
- Direct worker-to-worker communication
- Simplified authentication flow
- Everything in one platform