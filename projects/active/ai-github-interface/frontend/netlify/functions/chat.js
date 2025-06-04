// Chat function - v4 with SECURITY FIX - Never expose tokens!
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
    const MCP_ACCESS_TOKEN = process.env.MCP_ACCESS_TOKEN;
    const MCP_SERVER_URL = process.env.MCP_SERVER_URL;

    if (!MCP_ACCESS_TOKEN || !MCP_SERVER_URL) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          error: 'MCP server not configured',
          reply: 'The MCP integration is not properly configured. Please contact the administrator.',
          suggestions: ['Try again later', 'Contact support']
        })
      };
    }

    // SECURITY: Log for debugging but NEVER expose tokens
    console.log('MCP Configuration check:', {
      hasToken: !!MCP_ACCESS_TOKEN,
      hasServerUrl: !!MCP_SERVER_URL,
      serverUrl: MCP_SERVER_URL.replace(/https?:\/\/([^\/]+).*/, 'https://$1/***') // Partially mask URL
    });

    // Parse the user's intent
    const lower = message.toLowerCase();
    
    // Check MCP server logs (without exposing sensitive data)
    if (lower.includes('check') && lower.includes('logs')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: 'MCP server logs can only be viewed through the Cloudflare dashboard by authorized administrators. Server status: Attempting to connect...',
          suggestions: ['List my repositories', 'Show available tools', 'Create a file']
        })
      };
    }

    // Try to communicate with MCP server via JSON-RPC
    if (lower.includes('list') && lower.includes('repositories')) {
      try {
        // Convert SSE URL to JSON-RPC URL
        const jsonRpcUrl = MCP_SERVER_URL.replace('/sse', '/jsonrpc');
        
        console.log('Attempting MCP JSON-RPC call');
        
        // Make JSON-RPC request to MCP server
        const mcpResponse = await fetch(jsonRpcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MCP_ACCESS_TOKEN}`
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/call',
            params: {
              name: 'github__search_repositories',
              arguments: { 
                q: 'user:MCERQUA'
              }
            }
          })
        });

        console.log('MCP Response status:', mcpResponse.status);
        
        if (!mcpResponse.ok) {
          const errorText = await mcpResponse.text();
          console.error('MCP Error:', errorText);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              reply: `Unable to connect to MCP server (Status: ${mcpResponse.status}). This might be due to:
              - The MCP server may not have a JSON-RPC endpoint
              - Authentication may need to be configured differently
              - The server may be using SSE-only communication`,
              suggestions: ['Check MCP server documentation', 'Try a different command', 'Contact support']
            })
          };
        }

        const result = await mcpResponse.json();
        console.log('MCP Result received');

        if (result.error) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              reply: `MCP server returned an error: ${result.error.message || 'Unknown error'}`,
              suggestions: ['Check tool name', 'Verify parameters', 'Try a different command']
            })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            reply: '✅ Successfully communicated with remote MCP server! Here are your repositories:',
            result: result.result,
            success: true,
            suggestions: ['Create a new repository', 'View recent commits', 'Create an issue']
          })
        };

      } catch (error) {
        console.error('MCP communication error:', error);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            reply: `Failed to communicate with MCP server. The server might be using SSE-only protocol which is incompatible with serverless functions.`,
            error: 'Connection failed',
            suggestions: ['Check server status', 'Try again later', 'Use a different deployment method']
          })
        };
      }
    }

    // List available tools
    if (lower.includes('tools') || lower.includes('capabilities')) {
      try {
        const jsonRpcUrl = MCP_SERVER_URL.replace('/sse', '/jsonrpc');
        
        const mcpResponse = await fetch(jsonRpcUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${MCP_ACCESS_TOKEN}`
          },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: 'tools/list',
            params: {}
          })
        });

        if (mcpResponse.ok) {
          const result = await mcpResponse.json();
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              reply: 'Here are the available MCP tools:',
              result: result.result,
              success: true
            })
          };
        }
      } catch (error) {
        console.error('Error listing tools:', error);
      }
    }

    // Default response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: `I understand you want to: "${message}"

I'm attempting to communicate with the remote MCP server. Available commands:
- "List my repositories"
- "Show available tools"
- "Check MCP status"`,
        suggestions: ['List my repositories', 'Show available tools', 'Create a file', 'Check status']
      })
    };

  } catch (error) {
    console.error('Chat handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        reply: 'Sorry, I encountered an error processing your request.',
        suggestions: ['Try again', 'Contact support']
      })
    };
  }
};
