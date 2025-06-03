const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const EventSource = require('eventsource');
const WebSocket = require('ws');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MCP Server Configuration
const MCP_SERVER_URL = 'https://github-mcp-remote.metamike.workers.dev/sse';

class MCPClient {
  constructor() {
    this.eventSource = null;
    this.isConnected = false;
    this.requestId = 1;
    this.pendingRequests = new Map();
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to MCP Server:', MCP_SERVER_URL);
        
        this.eventSource = new EventSource(MCP_SERVER_URL, {
          headers: {
            'Authorization': `Bearer ${process.env.MCP_ACCESS_TOKEN}`,
            'Accept': 'text/event-stream',
            'Cache-Control': 'no-cache'
          }
        });

        this.eventSource.onopen = () => {
          console.log('✅ Connected to MCP Server');
          this.isConnected = true;
          resolve();
        };

        this.eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('📨 Received from MCP:', data);
            
            // Handle responses to pending requests
            if (data.id && this.pendingRequests.has(data.id)) {
              const { resolve: resolveRequest } = this.pendingRequests.get(data.id);
              this.pendingRequests.delete(data.id);
              resolveRequest(data);
            }
          } catch (error) {
            console.error('Error parsing MCP message:', error);
          }
        };

        this.eventSource.onerror = (error) => {
          console.error('❌ MCP Connection Error:', error);
          this.isConnected = false;
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (!this.isConnected) {
              console.log('🔄 Attempting to reconnect...');
              this.connect();
            }
          }, 5000);
        };

      } catch (error) {
        console.error('Failed to connect to MCP server:', error);
        reject(error);
      }
    });
  }

  async sendRequest(method, params = {}) {
    if (!this.isConnected) {
      throw new Error('MCP Client not connected');
    }

    const id = this.requestId++;
    const request = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      // Store the resolve function to call when response arrives
      this.pendingRequests.set(id, { resolve, reject });

      // Set timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000); // 30 second timeout

      // Send request via POST to the MCP server
      fetch(MCP_SERVER_URL.replace('/sse', '/jsonrpc'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MCP_ACCESS_TOKEN}`
        },
        body: JSON.stringify(request)
      }).catch(error => {
        this.pendingRequests.delete(id);
        reject(error);
      });
    });
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.isConnected = false;
    }
  }
}

// Global MCP client instance
const mcpClient = new MCPClient();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    mcpConnected: mcpClient.isConnected,
    timestamp: new Date().toISOString()
  });
});

// List available MCP tools
app.get('/api/tools', async (req, res) => {
  try {
    const response = await mcpClient.sendRequest('tools/list');
    res.json(response.result);
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// Execute GitHub operations through MCP
app.post('/api/github/:operation', async (req, res) => {
  try {
    const { operation } = req.params;
    const { params } = req.body;

    console.log(`🚀 Executing GitHub operation: ${operation}`, params);

    const response = await mcpClient.sendRequest(`tools/call`, {
      name: operation,
      arguments: params
    });

    res.json(response.result);
  } catch (error) {
    console.error('Error executing GitHub operation:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI Chat endpoint that processes natural language and translates to GitHub operations
app.post('/api/chat', async (req, res) => {
  try {
    const { message, context = [] } = req.body;

    // This is where you'd integrate with your AI model
    // For now, we'll create a simple parser for common GitHub operations
    const githubAction = parseGitHubIntent(message);

    if (githubAction) {
      const response = await mcpClient.sendRequest('tools/call', githubAction);
      res.json({
        reply: `I've executed the GitHub operation: ${githubAction.name}`,
        action: githubAction,
        result: response.result
      });
    } else {
      res.json({
        reply: "I can help you with GitHub operations like creating files, listing repositories, or managing issues. What would you like me to do?",
        suggestions: [
          "List my repositories",
          "Create a new file",
          "Show recent commits",
          "Create an issue"
        ]
      });
    }
  } catch (error) {
    console.error('Error in chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// Simple intent parser (you can replace this with a more sophisticated AI model)
function parseGitHubIntent(message) {
  const lower = message.toLowerCase();

  if (lower.includes('list') && (lower.includes('repo') || lower.includes('repositories'))) {
    return {
      name: 'local__GITHUB__search_repositories',
      arguments: { query: 'user:MCERQUA' }
    };
  }

  if (lower.includes('create') && lower.includes('file')) {
    // Extract file details from message (simplified)
    return {
      name: 'local__GITHUB__create_or_update_file',
      arguments: {
        owner: 'MCERQUA',
        repo: 'ECHO2', // Default repo
        path: 'test-file.md',
        content: '# Test file created via AI',
        message: 'Create test file via AI interface',
        branch: 'main'
      }
    };
  }

  return null;
}

// WebSocket for real-time communication
const server = require('http').createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('👤 New WebSocket connection');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'github-operation') {
        const response = await mcpClient.sendRequest('tools/call', data.payload);
        ws.send(JSON.stringify({
          type: 'github-response',
          id: data.id,
          result: response.result
        }));
      }
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message
      }));
    }
  });

  ws.on('close', () => {
    console.log('👤 WebSocket connection closed');
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server and connect to MCP
async function startServer() {
  try {
    // Connect to MCP server first
    await mcpClient.connect();
    
    // Start the HTTP server
    server.listen(PORT, () => {
      console.log(`🚀 AI GitHub Interface Backend running on port ${PORT}`);
      console.log(`📡 Connected to MCP Server: ${MCP_SERVER_URL}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down gracefully...');
  mcpClient.disconnect();
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

startServer();