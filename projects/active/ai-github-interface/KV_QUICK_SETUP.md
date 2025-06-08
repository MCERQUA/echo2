# Quick Setup Guide - KV Namespace for echo2.pages.dev

## 1. Create KV Namespace (Terminal)
```bash
wrangler kv:namespace create "SESSIONS"
```

Copy the namespace ID from output (looks like: `f9f9a00c752849c09409abb228600804`)

## 2. Configure in Cloudflare Dashboard

### Go to: https://dash.cloudflare.com
1. Select your account
2. Pages → echo2
3. Settings → Functions → KV namespace bindings

### Add KV Binding:
- Variable name: `SESSIONS`
- KV namespace: Select the namespace you created

### Add Environment Variables:
Settings → Environment variables
- `OPENAI_API_KEY`: Your OpenAI API key
- `GITHUB_TOKEN`: Your GitHub personal access token

## 3. Redeploy
Deployments → Click "Retry deployment" on the latest deployment

## 4. Verify
```bash
curl https://echo2.pages.dev/api/health
```

Should show:
```json
{
  "status": "healthy",
  "model": "OpenAI gpt-4.1-nano",
  "features": ["session_threading", "github_tools", "conversation_persistence"],
  ...
}
```

## Testing Session Threading

1. Create a session:
```bash
curl -X POST https://echo2.pages.dev/api/session
```

2. Chat with session:
```bash
curl -X POST https://echo2.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "My name is Mike",
    "sessionId": "YOUR_SESSION_ID"
  }'
```

3. Test memory:
```bash
curl -X POST https://echo2.pages.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is my name?",
    "sessionId": "YOUR_SESSION_ID"
  }'
```

The AI should remember your name!

## Troubleshooting

### "Session storage not configured"
- KV namespace not bound correctly
- Check binding name is exactly "SESSIONS"

### "OpenAI API key not configured"
- Add OPENAI_API_KEY to environment variables
- Redeploy after adding

### Sessions not persisting
- Check browser console for errors
- Verify KV namespace is working in Cloudflare dashboard
- Sessions expire after 24 hours
