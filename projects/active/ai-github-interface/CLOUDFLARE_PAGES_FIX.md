# Cloudflare Pages Deployment Configuration

## Current Status
The Echo Communication Terminal is deployed at: https://echo2.pages.dev

## Issue Fixed
The website was stuck on initialization because the worker functions weren't being deployed correctly.

## Solution Applied
1. Created a `functions` directory with the `_worker.js` file that contains all API endpoints
2. This follows Cloudflare Pages Functions structure where:
   - Static files (HTML, CSS, JS) go in the root directory
   - Worker functions go in the `functions` directory

## Deployment Structure
```
projects/active/ai-github-interface/
├── frontend/              # Static files (served by Cloudflare Pages)
│   ├── index.html
│   ├── terminal.css
│   ├── terminal.js
│   ├── chat.js
│   └── mobile.css
└── functions/            # Cloudflare Pages Functions
    └── _worker.js        # API endpoints (OpenAI + GitHub integration)
```

## Environment Variables Required
In Cloudflare Pages settings, add these environment variables:
- `OPENAI_API_KEY` - Your OpenAI API key
- `GITHUB_TOKEN` - Your GitHub personal access token
- `SESSIONS` - KV namespace binding (for session storage)

## To Deploy
1. In Cloudflare Pages dashboard for echo2
2. Go to Settings > Functions
3. Set build configuration:
   - Build command: (leave empty or `echo "No build needed"`)
   - Build output directory: `projects/active/ai-github-interface/frontend`
   - Root directory: `/`
4. Add environment variables listed above
5. Trigger a new deployment

## Manual Deployment Command
```bash
npx wrangler pages deploy projects/active/ai-github-interface/frontend --project-name=echo2
```

## Verify Deployment
After deployment, check:
1. https://echo2.pages.dev/api/health - Should return health status
2. The main page should show "Neural Link Active" instead of being stuck on initialization
