# AI GitHub Interface Website

An intelligent web interface that allows users to interact with GitHub repositories through natural language using our remote MCP server.

## 🎯 Features

- **Natural Language GitHub Operations**: Create files, update repos, manage issues through chat
- **Real-time AI Assistant**: Powered by remote MCP server at `https://github-mcp-remote.metamike.workers.dev/sse`
- **Secure Authentication**: Uses existing GitHub OAuth flow
- **Repository Management**: Browse, create, update files across repositories
- **Modern UI**: Clean, responsive interface with real-time feedback

## 🏗️ Architecture

```
Frontend (React/HTML) 
    ↓
Backend API (Node.js/Express)
    ↓
Remote MCP Server (Cloudflare Workers)
    ↓
GitHub API
```

## 🚀 Deployment

- **Frontend**: Netlify (https://ai-github-interface.netlify.app/)
- **Backend**: Netlify Functions (Serverless)
- **MCP Server**: Already deployed to Cloudflare Workers

## 📁 Project Structure

```
ai-github-interface/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/        # Page components
│   │   └── services/     # API services
│   └── public/           # Static assets
├── backend/              # Node.js API server
│   ├── routes/          # API routes
│   ├── services/        # MCP connection logic
│   └── middleware/      # Auth & validation
└── docs/                # Documentation
```

## 🔧 Technology Stack

- **Frontend**: React, Tailwind CSS, Axios
- **Backend**: Node.js, Express, WebSocket
- **MCP Integration**: Server-Sent Events (SSE)
- **Authentication**: GitHub OAuth
- **Deployment**: Netlify + Railway/Render

## 📝 Development Status

- [x] Project structure created
- [x] Frontend UI development
- [x] Backend MCP integration via Netlify Functions
- [x] Authentication flow (OAuth via MCP server)
- [x] Deployment setup (Live at https://ai-github-interface.netlify.app/)
- [x] Environment variables configured (MCP_ACCESS_TOKEN, MCP_SERVER_URL)
- [ ] Awaiting deployment trigger for environment variables to take effect
