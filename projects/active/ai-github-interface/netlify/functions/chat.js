const EventSource = require('eventsource');

// MCP Server Configuration
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'https://github-mcp-remote.metamike.workers.dev/sse';
const MCP_ACCESS_TOKEN = process.env.MCP_ACCESS_TOKEN;

// Simple intent parser
function parseGitHubIntent(message) {
  const lower = message.toLowerCase();

  if (lower.includes('list') && (lower.includes('repo') || lower.includes('repositories'))) {
    return {
      name: 'local__GITHUB__search_repositories',
      arguments: { query: 'user:MCERQUA' }
    };
  }

  if (lower.includes('create') && lower.includes('file')) {
    return {
      name: 'local__GITHUB__create_or_update_file',
      arguments: {
        owner: 'MCERQUA',
        repo: 'ECHO2',
        path: 'test-file.md',
        content: '# Test file created via AI',
        message: 'Create test file via AI interface',
        branch: 'main'
      }
    };
  }

  if (lower.includes('commit') && (lower.includes('recent') || lower.includes('latest'))) {
    return {
      name: 'local__GITHUB__list_commits',
      arguments: {
        owner: 'MCERQUA',
        repo: 'ECHO2'
      }
    };
  }

  return null;
}

// Send request to MCP server
async function sendMCPRequest(method, params = {}) {
  const request = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params
  };

  try {
    const response = await fetch(MCP_SERVER_URL.replace('/sse', ''), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MCP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`MCP request failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('MCP Request Error:', error);
    throw error;
  }
}

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { message } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    console.log('Processing message:', message);

    // Parse the GitHub intent
    const githubAction = parseGitHubIntent(message);

    if (githubAction) {
      // Execute GitHub operation through MCP
      const response = await sendMCPRequest('tools/call', githubAction);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: `I've executed the GitHub operation: ${githubAction.name}`,
          action: githubAction,
          result: response.result
        })
      };
    } else {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: "I can help you with GitHub operations like listing repositories, creating files, or showing recent commits. What would you like me to do?",
          suggestions: [
            "List my repositories",
            "Create a new file", 
            "Show recent commits"
          ]
        })
      };
    }

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
};