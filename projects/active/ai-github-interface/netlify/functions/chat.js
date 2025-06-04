// Chat function for Netlify - connects to Cloudflare MCP server
exports.handler = async (event, context) => {
  console.log('Chat function called');
  
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
    const MCP_SERVER_URL = process.env.MCP_SERVER_URL;
    const MCP_ACCESS_TOKEN = process.env.MCP_ACCESS_TOKEN;
    
    console.log('Environment check:', {
      hasMcpUrl: !!MCP_SERVER_URL,
      hasMcpToken: !!MCP_ACCESS_TOKEN,
      mcpUrl: MCP_SERVER_URL
    });

    if (!MCP_SERVER_URL || !MCP_ACCESS_TOKEN) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: "I'm not configured yet! Please add the MCP_ACCESS_TOKEN environment variable in Netlify settings.",
          error: "Missing environment variables"
        })
      };
    }

    const { message } = JSON.parse(event.body || '{}');

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Message is required' })
      };
    }

    console.log('Processing message:', message);

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
            path: `ai-created-${Date.now()}.md`,
            content: '# File created via AI\n\nThis file was created through the AI GitHub Interface!',
            message: 'Create file via AI interface',
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

      // Use the correct MCP endpoint - remove /sse for JSON-RPC calls
      const mcpEndpoint = MCP_SERVER_URL.includes('/sse') 
        ? MCP_SERVER_URL.replace('/sse', '') 
        : MCP_SERVER_URL;

      console.log('Sending MCP request to:', mcpEndpoint);
      console.log('Request:', JSON.stringify(request, null, 2));
      console.log('Token (first 20 chars):', MCP_ACCESS_TOKEN.substring(0, 20) + '...');

      try {
        const response = await fetch(mcpEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MCP_ACCESS_TOKEN}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(request)
        });

        console.log('MCP response status:', response.status);
        console.log('MCP response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.log('MCP error response:', errorText);
          throw new Error(`MCP request failed: ${response.status} ${response.statusText}. Response: ${errorText}`);
        }

        const responseText = await response.text();
        console.log('MCP raw response:', responseText);

        if (!responseText) {
          throw new Error('Empty response from MCP server');
        }

        const responseData = JSON.parse(responseText);
        console.log('MCP parsed response:', JSON.stringify(responseData, null, 2));
        return responseData;

      } catch (error) {
        console.error('MCP Request Error:', error);
        throw error;
      }
    }

    // Parse the GitHub intent
    const githubAction = parseGitHubIntent(message);

    if (githubAction) {
      try {
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
      } catch (error) {
        console.error('MCP operation failed:', error);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            reply: `Sorry, I encountered an error executing the GitHub operation: ${error.message}`,
            error: error.message,
            action: githubAction
          })
        };
      }
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
        message: error.message,
        stack: error.stack
      })
    };
  }
};