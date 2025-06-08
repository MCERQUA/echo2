# AI Message Server - Setup Guide

## Overview

The AI Message Server (echo2.pages.dev) is a web-based chat interface that:
1. Uses Groq AI for intelligent responses (free tier available)
2. Maintains GitHub MCP functionality for repository operations
3. Saves all conversations to ECHO-MESSAGE-SERVER repository for Echo to review

## Features

- **Groq AI Integration**: Uses Mixtral-8x7b model for fast, intelligent responses
- **GitHub Operations**: List repositories, create files, manage issues
- **Message Queue**: All conversations saved as markdown files in ECHO-MESSAGE-SERVER
- **Real-time Status**: Shows connection status and save confirmations
- **Conversation Tracking**: Each session gets a unique ID for easy reference

## Setup Instructions

### 1. Environment Variables

Add these to your Cloudflare Pages project settings:

```
GROQ_API_KEY=your_groq_api_key_here
GITHUB_TOKEN=your_github_personal_access_token_here
```

### 2. Get API Keys

**Groq API Key (Free)**:
1. Go to https://console.groq.com
2. Sign up for free account
3. Create an API key in settings

**GitHub Token**:
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate new token with `repo` scope
3. Save the token securely

### 3. Deploy to Cloudflare Pages

The site should automatically deploy when you push changes. The `_worker.js` file handles all API logic.

## How It Works

### Message Flow

1. User types message in web interface
2. Message sent to Cloudflare Worker
3. Worker determines if it's a GitHub operation or general query
4. For general queries: Calls Groq AI API
5. For GitHub ops: Uses GitHub API directly
6. Response shown to user
7. Entire exchange saved to ECHO-MESSAGE-SERVER repo

### File Structure in ECHO-MESSAGE-SERVER

```
messages/
├── YYYY-MM-DD/
│   ├── conv-[id]-msg-0001.md
│   ├── conv-[id]-msg-0002.md
│   └── ...
conversations/
├── YYYY-MM-DD/
│   └── conv-[id]-summary.md
```

### Message Format

Each message is saved as:

```markdown
---
id: conv-123456-1
timestamp: 2025-06-06T12:00:00Z
client: web-interface
type: message
status: new
---

# User Message

[What the user typed]

# AI Response

[What the AI responded]
```

## For Echo's Review

During our sessions, you can:
1. Check the ECHO-MESSAGE-SERVER repository for new messages
2. Review task requests in the `tasks/pending` folder
3. Update status of processed messages
4. Extract action items from conversations

## Troubleshooting

**"Disconnected" Status**: 
- Check if environment variables are set
- Verify API keys are valid

**Messages Not Saving**:
- Ensure GitHub token has repo write permissions
- Check browser console for errors

**AI Not Responding**:
- Verify Groq API key is active
- Check Groq API status at console.groq.com

## Future Enhancements

- Task extraction automation
- Priority flagging for urgent requests
- Client identification system
- Advanced GitHub operations
- File upload support
