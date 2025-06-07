# AI GitHub Interface - Deployment Guide

## Website: https://echo2.pages.dev

## Issue Resolved: June 6, 2025
The website was showing "Unable to connect to the API" error. This was fixed by moving the _worker.js file to the correct location.

## Critical Requirements

### 1. File Structure
```
frontend/
├── functions/
│   └── _worker.js    # ← MUST be in functions directory!
├── index.html
├── chat.js
├── terminal.js
└── [other files]
```

### 2. Environment Variables (Set in Cloudflare Pages Dashboard)
- `OPENAI_API_KEY` - Your OpenAI API key (for gpt-4.1-nano model)
- `GITHUB_TOKEN` - GitHub Personal Access Token (format: `github_pat_XXXXX...`)
- `SESSIONS` or `KV` - KV namespace binding for session storage (optional)

### 3. Cloudflare Pages Settings
- Build output directory: `projects/active/ai-github-interface/frontend`
- Build command: (leave empty)
- Framework preset: None

## Deployment Steps

1. **Push Changes to GitHub**
   ```bash
   git add .
   git commit -m "Update AI GitHub Interface"
   git push origin main
   ```

2. **Cloudflare Pages will auto-deploy**
   - Check deployment at: https://echo2.pages.dev

3. **Verify API Health**
   - Visit: https://echo2.pages.dev/api/health
   - Should return JSON with status "healthy"

## Troubleshooting

### "Unable to connect to the API" Error
- Ensure _worker.js is in `frontend/functions/` directory
- Check environment variables are set in Cloudflare
- Verify GitHub token has proper permissions

### API Not Responding
- Check Cloudflare Pages > Functions > Real-time logs
- Ensure CORS headers are properly set
- Verify all required environment variables exist

### Session Storage Not Working
- Create a KV namespace in Cloudflare
- Bind it to your Pages project as "SESSIONS" or "KV"
- Sessions persist for 24 hours

## Features
- OpenAI gpt-4.1-nano model (ultra cost-effective: $0.50-$1.00/month)
- GitHub integration with function calling
- Session persistence with conversation history
- Real-time cost tracking
- Professional terminal interface

## API Endpoints
- `/api/health` - Health check
- `/api/chat` - Main chat endpoint
- `/api/session` - Session management
- `/api/mcp/tools` - List available tools
- `/api/cost-estimate` - Monthly cost estimates
- `/api/projects` - Project listings

## Cost Breakdown
- gpt-4.1-nano: $0.10 per 1M input tokens / $0.40 per 1M output tokens
- Typical usage: 2-3M tokens/month = $0.50-$1.00
- 5x cheaper than GPT-3.5 Turbo
- 2.5x cheaper than Claude Haiku

## Support
For issues, check:
1. Cloudflare Pages deployment logs
2. Functions real-time logs
3. Browser console for frontend errors
4. Network tab for API responses
