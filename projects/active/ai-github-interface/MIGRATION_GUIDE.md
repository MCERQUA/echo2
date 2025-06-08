# Quick Migration Guide: Enable Real MCP on echo2.pages.dev

## Current Status
- ❌ Using Groq AI (no MCP tool support)
- ❌ Pattern matching instead of tool protocols
- ❌ Limited to hardcoded GitHub operations
- ✅ Basic GitHub API calls work

## Migration Steps

### Step 1: Get Claude API Key
1. Go to https://console.anthropic.com/
2. Create an API key
3. Choose Claude 3 Haiku for cost efficiency (~$0.25 per million tokens)

### Step 2: Update Cloudflare Environment Variables
1. Go to Cloudflare Pages > echo2 > Settings > Environment variables
2. Add: `ANTHROPIC_API_KEY` = your-claude-api-key
3. Keep: `GITHUB_TOKEN` = your-github-pat

### Step 3: Deploy New Worker
Option A - Quick Test:
```bash
# Rename files to test
mv frontend/_worker.js frontend/_worker_old.js
mv frontend/_worker_mcp.js frontend/_worker.js
git add .
git commit -m "Switch to MCP implementation"
git push
```

Option B - Side-by-side:
```bash
# Create new deployment for testing
# Deploy to echo2-mcp.pages.dev with _worker_mcp.js as _worker.js
```

### Step 4: Update Frontend (Minimal Changes)

In `chat.js`, update the system prompt:

```javascript
// OLD - Groq-specific
const systemPrompt = `You are Echo's AI Message Center Assistant...`

// NEW - Claude with tools
const systemPrompt = `You are Echo's AI Assistant with access to GitHub tools.
You can search repositories, read files, create issues, and more.
When users ask about GitHub operations, use the appropriate tools.`
```

Update the API call:

```javascript
// OLD - Groq API format
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ 
    message,
    conversationHistory 
  })
});

// NEW - Claude format
const response = await fetch('/api/chat', {
  method: 'POST',
  body: JSON.stringify({ 
    messages: [
      { role: 'user', content: message }
    ]
  })
});
```

### Step 5: Test MCP Tools

1. **Check tool availability:**
   ```
   curl https://echo2.pages.dev/api/mcp/tools
   ```

2. **Test in chat:**
   - "Search for TypeScript repositories by Microsoft"
   - "Get the README from MCERQUA/echo2"
   - "Create an issue in ECHO-MESSAGE-SERVER"

## Cost Comparison

| Service | Cost | MCP Tools | Quality |
|---------|------|-----------|---------|
| Groq (current) | Free | ❌ No | Basic |
| Claude Haiku | $0.25/1M tokens | ✅ Yes | Good |
| Claude Sonnet | $3/1M tokens | ✅ Yes | Better |
| Claude Opus | $15/1M tokens | ✅ Yes | Best |

**Recommendation**: Start with Haiku - it's very cheap and supports all MCP tools.

## What You'll Get

### Before (Current):
```
User: "List my recent repos"
AI: *checks if message contains 'list' and 'repo'*
AI: *makes hardcoded API call*
AI: "Here are 10 repos..."
```

### After (With MCP):
```
User: "Find all my Python repos with CI/CD workflows"
AI: *understands the complex request*
AI: *uses search_repositories tool with query*
AI: *uses get_file_contents to check for .github/workflows*
AI: "Found 3 Python repos with CI/CD: ..."
```

## Fallback Plan

If you want to keep Groq for cost reasons but add basic MCP-style tools:

1. Keep current implementation
2. Add tool definitions endpoint
3. Create middleware that translates Groq responses to tool calls
4. Less capable but free

## Quick Decision

**Want the same tools I have?** → Use Claude with `_worker_mcp.js`
**Want to stay free?** → Keep current setup but accept limitations
**Want middle ground?** → Use Claude Haiku (very cheap, full tools)

The key difference: With real MCP, the AI understands and uses tools dynamically, not through hardcoded patterns.
