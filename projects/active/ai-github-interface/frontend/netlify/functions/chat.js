// Chat function - v3 with MCP JSON-RPC communication
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
          reply: 'The MCP integration is not properly configured. Please check the environment variables.',
          suggestions: ['Contact administrator', 'Check configuration']
        })
      };
    }

    // Debug: Log configuration
    console.log('MCP Configuration:', {
      hasToken: !!MCP_ACCESS_TOKEN,
      tokenPrefix: MCP_ACCESS_TOKEN.substring(0, 20) + '...',
      serverUrl: MCP_SERVER_URL
    });

    // Parse the user's intent
    const lower = message.toLowerCase();
    
    // Try to communicate with MCP server via JSON-RPC
    if (lower.includes('list') && lower.includes('repositories')) {
      try {
        // Convert SSE URL to JSON-RPC URL
        const jsonRpcUrl = MCP_SERVER_URL.replace('/sse', '/jsonrpc');
        
        console.log('Attempting MCP JSON-RPC call to:', jsonRpcUrl);
        
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
              reply: `MCP server returned an error (${mcpResponse.status}). The remote MCP server might not support JSON-RPC endpoint or the authentication might be incorrect.`,
              error: `HTTP ${mcpResponse.status}`,
              debug: {
                url: jsonRpcUrl,
                status: mcpResponse.status,
                tokenFormat: MCP_ACCESS_TOKEN.split('.')[0] + '...'
              },
              suggestions: ['Check MCP server logs', 'Verify authentication', 'Try a different approach']
            })
          };
        }

        const result = await mcpResponse.json();
        console.log('MCP Result:', result);

        if (result.error) {
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              reply: `MCP server returned an error: ${result.error.message}`,
              error: result.error,
              suggestions: ['Check tool name', 'Verify parameters', 'Contact support']
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
            reply: `Failed to communicate with MCP server: ${error.message}`,
            error: error.message,
            debug: {
              serverUrl: MCP_SERVER_URL,
              tokenFormat: MCP_ACCESS_TOKEN.split('.')[0] + '...'
            },
            suggestions: ['Check network connectivity', 'Verify MCP server is running', 'Review logs']
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
        reply: `I understand you want to: "${message}"\\n\\nI'm attempting to communicate with the remote MCP server. Available commands:\\n- "List my repositories"\\n- "Show available tools"\\n- "Check MCP status"`,
        result: {
          request: message,
          mcpConfigured: true,
          serverUrl: MCP_SERVER_URL,
          tokenFormat: MCP_ACCESS_TOKEN.split('.')[0] + '...'
        },
        suggestions: ['List my repositories', 'Show available tools', 'Create a file', 'Check status']
      })
    };

  } catch (error) {
    console.error('Chat handler error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        reply: 'Sorry, I encountered an error processing your request.',
        suggestions: ['Try again', 'Check logs']
      })
    };
  }
};
