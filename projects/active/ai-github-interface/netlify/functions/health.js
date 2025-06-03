const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'https://github-mcp-remote.metamike.workers.dev/sse';
const MCP_ACCESS_TOKEN = process.env.MCP_ACCESS_TOKEN;

exports.handler = async (event, context) => {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Test MCP connection
    let mcpConnected = false;
    try {
      const testResponse = await fetch(MCP_SERVER_URL.replace('/sse', ''), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MCP_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'tools/list',
          params: {}
        })
      });
      
      mcpConnected = testResponse.ok;
    } catch (error) {
      console.error('MCP health check failed:', error);
      mcpConnected = false;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'healthy',
        mcpConnected,
        serverless: true,
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Health check error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        status: 'error',
        mcpConnected: false,
        error: error.message 
      })
    };
  }
};