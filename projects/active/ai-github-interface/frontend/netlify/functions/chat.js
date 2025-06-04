// Simplified chat function for testing
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
    const MCP_SERVER_URL = process.env.MCP_SERVER_URL;
    const MCP_ACCESS_TOKEN = process.env.MCP_ACCESS_TOKEN;

    if (!MCP_SERVER_URL || !MCP_ACCESS_TOKEN) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          error: 'MCP server not configured',
          reply: 'The AI assistant is not properly configured. Please check the environment variables.',
          suggestions: ['Contact administrator', 'Check configuration']
        })
      };
    }

    // For now, just echo back to confirm it's working
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: `I received your message: "${message}". The MCP connection is configured and ready!`,
        result: {
          mcpUrl: MCP_SERVER_URL,
          hasToken: !!MCP_ACCESS_TOKEN
        },
        suggestions: ['List repositories', 'Create a file', 'Search code']
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
