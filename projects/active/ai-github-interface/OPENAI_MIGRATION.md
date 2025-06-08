# OpenAI gpt-4.1-nano - Ultra Cost-Effective GitHub Tools

## 🎉 Amazing News: gpt-4.1-nano is SUPER CHEAP!

OpenAI's **gpt-4.1-nano** model is perfect for your GitHub MCP tools:
- **Input**: $0.10 per 1M tokens (80% cheaper than GPT-3.5!)
- **Cached input**: $0.025 per 1M tokens  
- **Output**: $0.40 per 1M tokens

## 💰 Cost Comparison

| Model | Input (1M) | Output (1M) | Monthly Est* | Function Support |
|-------|------------|-------------|--------------|------------------|
| **gpt-4.1-nano** ⭐ | $0.10 | $0.40 | **$0.50-$1.00** | ✅ Yes |
| GPT-3.5 Turbo | $0.50 | $1.50 | $3-5 | ✅ Yes |
| Claude Haiku | $0.25 | $1.25 | $2-4 | ✅ Yes |
| Groq (current) | Free | Free | $0 | ❌ No |

*For typical usage of 2-3M tokens per month

## 🚀 Quick Setup Guide

### Step 1: Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Save it securely

### Step 2: Deploy to Cloudflare
1. Add environment variable in Cloudflare Pages:
   - `OPENAI_API_KEY` = your-api-key
   - Keep `GITHUB_TOKEN` = your-github-pat

2. Deploy the updated worker:
```bash
# The _worker_openai.js is already updated for gpt-4.1-nano
mv frontend/_worker.js frontend/_worker_groq_backup.js
mv frontend/_worker_openai.js frontend/_worker.js
git add .
git commit -m "Switch to OpenAI gpt-4.1-nano for ultra-low cost"
git push
```

### Step 3: Update Frontend (minimal changes)
In `chat.js`, update to use the new format:
```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    messages: [
      { role: 'user', content: userMessage }
    ]
  })
});

const data = await response.json();
console.log('Response:', data.response);
console.log('Cost:', data.usage.estimated_cost); // Track costs!
```

## 📊 What You Get

### With gpt-4.1-nano:
- ✅ **Full GitHub tool support** - Same as Claude MCP
- ✅ **Ultra-low cost** - ~$0.50-$1.00 per month
- ✅ **Fast responses** - Optimized for speed
- ✅ **Production ready** - Stable API

### Available Tools:
- `search_repositories` - Search GitHub repos with filters
- `get_file_contents` - Read any file from any repo
- `create_or_update_file` - Write/update files
- `create_issue` - Create GitHub issues
- `list_issues` - List and filter issues

## 🎯 Why gpt-4.1-nano is Perfect

1. **Incredibly Cheap**: 5x cheaper than GPT-3.5 Turbo
2. **Tool Support**: Full function calling capabilities
3. **Fast**: Optimized for quick responses
4. **Good Enough**: Perfect for tool use cases

## 📈 Cost Tracking

The implementation includes real-time cost tracking:
```json
{
  "response": "Found 5 repositories matching your search...",
  "usage": {
    "prompt_tokens": 245,
    "completion_tokens": 89,
    "total_tokens": 334,
    "estimated_cost": "$0.000167"  // Less than 1/50th of a cent!
  }
}
```

## 🔧 Test Endpoints

After deployment:
1. **Health check**: `https://echo2.pages.dev/api/health`
2. **Cost estimate**: `https://echo2.pages.dev/api/cost-estimate`
3. **List tools**: `https://echo2.pages.dev/api/mcp/tools`

## 💡 Monthly Cost Examples

Based on usage patterns:
- **Light use** (1M tokens): ~$0.25/month
- **Medium use** (3M tokens): ~$0.75/month
- **Heavy use** (5M tokens): ~$1.25/month

Compare to:
- Current Groq: $0 but NO tools ❌
- GPT-3.5: $3-15/month
- Claude: $2-10/month

## 🚦 Ready to Deploy?

The `_worker_openai.js` is already configured for gpt-4.1-nano. Just:
1. Get your OpenAI API key
2. Add it to Cloudflare
3. Deploy!

Your echo2.pages.dev will have full GitHub MCP tools for less than $1/month! 🎉
