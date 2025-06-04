// Health check function for Netlify
// Build timestamp: 2025-06-03T20:36:00Z - Force rebuild with env vars
exports.handler = async (event, context) => {
  console.log('Health check called - v2');
  
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
          version: 'v2',
          timestamp: new Date().toISOString()
        })
      };
    }

    // Test MCP connection
    let mcpConnected = false;
    let mcpError = null;
    
    try {
      console.log('Testing MCP connection to:', MCP_SERVER_URL);
      
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
      
      console.log('MCP response status:', testResponse.status);
      mcpConnected = testResponse.ok;
      
      if (!testResponse.ok) {
        mcpError = `HTTP ${testResponse.status}: ${testResponse.statusText}`;
      }
      
    } catch (error) {
      console.error('MCP health check failed:', error);
      mcpConnected = false;
      mcpError = error.message;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'healthy',
        mcpConnected,
        mcpError,
        serverless: true,
        environment: {
          hasUrl: !!MCP_SERVER_URL,
          hasToken: !!MCP_ACCESS_TOKEN,
          url: MCP_SERVER_URL
        },
        version: 'v2',
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
        version: 'v2'
      })
    };
  }
};
