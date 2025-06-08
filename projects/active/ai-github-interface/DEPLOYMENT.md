# Deployment Guide

## Current Status: ✅ WORKING

**Live URL**: https://echo2.pages.dev

## Quick Deployment Steps

1. **Platform**: Cloudflare Pages (ONLY - don't use Netlify)
2. **Repository**: Connect to your GitHub repo
3. **Build Settings**:
   - Framework: None
   - Build command: (leave empty)
   - Build output directory: `frontend`
4. **Environment Variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `GITHUB_TOKEN`: GitHub Personal Access Token

## File Structure
```
frontend/
├── _worker.js     # ✅ Critical file - handles all API routes
├── index.html     # Main interface
├── chat.js        # Frontend logic
└── terminal.css   # Styling
```

## Testing
- Health check: https://echo2.pages.dev/api/health
- Should return: `{"status": "healthy", "timestamp": "..."}`

## Troubleshooting
- Deployment fails: Check environment variables
- API errors: Verify `_worker.js` is in root directory
- 404 errors: Ensure build output points to `frontend` folder