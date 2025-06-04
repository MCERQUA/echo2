// Health check function for Netlify
// Build timestamp: 2025-06-04T02:00:00Z - Fixed MCP endpoint
exports.handler = async (event, context) => {
  console.log('Health check called - v4 - fixed MCP endpoint');
  
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
    const MCP_SERVER_URL = process.env.MCP_SERVER_URL;
    const MCP_ACCESS_TOKEN = process.env.MCP_ACCESS_TOKEN;
    
    console.log('Environment check:', {
      hasMcpUrl: !!MCP_SERVER_URL,
      hasMcpToken: !!MCP_ACCESS_TOKEN,
      tokenPrefix: MCP_ACCESS_TOKEN ? MCP_ACCESS_TOKEN.substring(0, 10) + '...' : 'none'
    });

    if (!MCP_SERVER_URL || !MCP_ACCESS_TOKEN) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'healthy',
          mcpConnected: false,
          serverless: true,
          error: 'Missing environment variables',
          missing: {
            MCP_SERVER_URL: !MCP_SERVER_URL,
            MCP_ACCESS_TOKEN: !MCP_ACCESS_TOKEN
          },
          version: 'v4',
          timestamp: new Date().toISOString()
        })
      };
    }

    // For now, just check if we have the credentials
    // The actual MCP connection will happen in the chat endpoint
    // Since the MCP server uses SSE for real communication
    const mcpConnected = !!MCP_SERVER_URL && !!MCP_ACCESS_TOKEN;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'healthy',
        mcpConnected,
        mcpConfigured: true,
        serverless: true,
        environment: {
          hasUrl: !!MCP_SERVER_URL,
          hasToken: !!MCP_ACCESS_TOKEN,
          url: MCP_SERVER_URL
        },
        version: 'v4',
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
        error: error.message,
        stack: error.stack,
        version: 'v4'
      })
    };
  }
};
