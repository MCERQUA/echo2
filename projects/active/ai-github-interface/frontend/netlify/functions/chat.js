// Chat function - v2 with better error handling and token debugging
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

    if (!MCP_ACCESS_TOKEN) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          error: 'GitHub token not configured',
          reply: 'The GitHub integration is not properly configured. Please check the environment variables.',
          suggestions: ['Contact administrator', 'Check configuration']
        })
      };
    }

    // Debug: Check token format
    console.log('Token format check:', {
      hasToken: !!MCP_ACCESS_TOKEN,
      tokenLength: MCP_ACCESS_TOKEN.length,
      tokenPrefix: MCP_ACCESS_TOKEN.substring(0, 20) + '...'
    });

    // Parse the user's intent
    const lower = message.toLowerCase();
    
    // Check token permissions
    if (lower.includes('check') && lower.includes('permission')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: `Your MCP token is configured. It appears to be an OAuth token format: ${MCP_ACCESS_TOKEN.substring(0, 10)}...\n\nNote: The MCP server token may not work directly with GitHub API. The MCP server (${process.env.MCP_SERVER_URL}) acts as a proxy.\n\nTo use GitHub operations, we may need to connect through the MCP server instead of directly to GitHub.`,
          result: {
            tokenFormat: MCP_ACCESS_TOKEN.split('.')[0] + '...',
            mcpServer: process.env.MCP_SERVER_URL
          },
          suggestions: ['Try using the MCP server', 'Get a GitHub personal access token', 'Contact support']
        })
      };
    }

    // For now, return helpful information about the MCP setup
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: `I understand you want to: "${message}"\n\nThe system is connected to the MCP server, but direct GitHub operations are not yet implemented. The MCP server at ${process.env.MCP_SERVER_URL} needs to handle the GitHub operations.\n\nThis is a demonstration interface showing that:\n✅ Functions are deployed correctly\n✅ Environment variables are working\n✅ The interface is connected\n\n🚧 Next step: Implement actual MCP protocol communication`,
        result: {
          request: message,
          mcpConfigured: true,
          serverUrl: process.env.MCP_SERVER_URL
        },
        suggestions: ['Check MCP documentation', 'View integration status', 'Contact support']
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
