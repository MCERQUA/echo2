# OpenAI Session Threading Deployment Guide

## Overview
The echo2.pages.dev website has been updated to use OpenAI's gpt-4.1-nano model with proper session threading. This enables persistent conversations where the AI remembers previous messages and can properly use GitHub tools.

## Key Features Added
1. **Session Management**: Each conversation gets a unique session ID stored for 24 hours
2. **Conversation Threading**: AI maintains context across messages
3. **Tool Usage**: Full GitHub MCP tools support (search, read files, create issues, etc.)
4. **Cost Tracking**: Real-time cost estimates per message
5. **Session Persistence**: Resume conversations even after page refresh

## Deployment Steps

### 1. Configure Cloudflare KV Namespace
The session threading requires a KV namespace for storing conversation history.

```bash
# Create KV namespace (if not already exists)
wrangler kv:namespace create "SESSIONS"

# Note the namespace ID from the output
# Example: { binding = "SESSIONS", id = "xxxxxx" }
```

### 2. Update Environment Variables
Add these to your Cloudflare Pages environment:

- `OPENAI_API_KEY`: Your OpenAI API key
- `GITHUB_TOKEN`: Your GitHub personal access token  
- `SESSIONS`: KV namespace binding (configured in Pages settings)

### 3. Configure KV Binding in Cloudflare Dashboard
1. Go to your Cloudflare Pages project
2. Settings → Functions → KV namespace bindings
3. Add binding:
   - Variable name: `SESSIONS`
   - KV namespace: Select the namespace you created

### 4. Deploy the Updated Code
The repository already contains the updated files:
- `_worker.js`: Updated with session management
- `chat.js`: Updated frontend to handle sessions

Simply push to trigger deployment, or manually deploy:
```bash
# From the frontend directory
wrangler pages publish . --project-name=echo2
```

## Testing the Implementation

### 1. Check Health Endpoint
```bash
curl https://echo2.pages.dev/api/health
```

Should return:
```json
{
  "status": "healthy",
  "model": "OpenAI gpt-4.1-nano",
  "features": ["session_threading", "github_tools", "conversation_persistence"],
  ...
}
```

### 2. Test Session Creation
```bash
curl -X POST https://echo2.pages.dev/api/session
```

Should return:
```json
{
  "sessionId": "xxxxx-xxxxx",
  "message": "Session created successfully"
}
```

### 3. Test Conversation Threading
1. Open https://echo2.pages.dev
2. Send a message: "My name is Mike"
3. Send another: "What's my name?"
4. AI should remember your name from the first message

### 4. Test GitHub Tools
Try these commands:
- "Search for repositories about AI"
- "Show me the README from MCERQUA/echo2"
- "Create an issue in MCERQUA/echo2 titled 'Test from AI'"

## UI Changes
The interface now shows:
- Session ID in the connection status
- "Clear" button to start new sessions
- Cost per message in the response
- Keyboard shortcut: Ctrl/Cmd + K to clear session

## Cost Estimates
With gpt-4.1-nano:
- Input: $0.10 per million tokens
- Output: $0.40 per million tokens
- Typical usage: $0.50-$1.00 per month
- 5x cheaper than GPT-3.5 Turbo

## Troubleshooting

### "Session storage not configured" Error
- Ensure KV namespace is properly bound in Cloudflare Pages settings
- Variable name must be exactly "SESSIONS"

### "OpenAI API key not configured" Error
- Add OPENAI_API_KEY to environment variables
- Redeploy after adding the key

### Tools Not Working
- Verify GITHUB_TOKEN is set in environment
- Check token has necessary permissions (repo, issues)

### Session Not Persisting
- Check browser localStorage is enabled
- Verify KV namespace is working (check Cloudflare dashboard)
- Sessions expire after 24 hours

## Advanced Configuration

### Adjust Session Duration
In `_worker.js`, find:
```javascript
expirationTtl: 86400 // 24 hours
```
Change to desired duration in seconds.

### Change Model
To use a different OpenAI model, update:
```javascript
model: 'gpt-4.1-nano-2025-04-14'
```
Options:
- `gpt-3.5-turbo`: More expensive but more capable
- `gpt-4-turbo`: Most capable but significantly more expensive

### Adjust Context Window
To change how many messages are kept in context:
```javascript
const recentMessages = session.messages.slice(-20); // Last 20 messages
```

## Monitoring
- Check Cloudflare Analytics for usage
- Monitor KV operations in Cloudflare dashboard
- Track costs in OpenAI usage dashboard

## Next Steps
1. Deploy the changes
2. Test all features work correctly
3. Monitor costs for a few days
4. Adjust model or limits if needed

The website is now fully capable of maintaining conversations and using GitHub tools just like I (Echo) can in this chat interface!
