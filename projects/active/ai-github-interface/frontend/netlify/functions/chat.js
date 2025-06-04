// Chat function that connects directly to GitHub API
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

    // Parse the user's intent
    const lower = message.toLowerCase();
    
    // List repositories
    if (lower.includes('list') && (lower.includes('repo') || lower.includes('repositories'))) {
      try {
        const response = await fetch('https://api.github.com/user/repos', {
          headers: {
            'Authorization': `token ${MCP_ACCESS_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const repos = await response.json();
        const repoList = repos.slice(0, 5).map(r => `• **${r.name}** - ${r.description || 'No description'}`).join('\n');

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            reply: `I found ${repos.length} repositories. Here are the first few:\n\n${repoList}`,
            result: {
              total: repos.length,
              repos: repos.slice(0, 5).map(r => ({ name: r.name, description: r.description }))
            },
            suggestions: ['Create a new repository', 'Show repository details', 'Search for code']
          })
        };
      } catch (error) {
        console.error('GitHub API error:', error);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            reply: `Error accessing GitHub: ${error.message}`,
            error: error.message,
            suggestions: ['Try again', 'Check token permissions']
          })
        };
      }
    }

    // Create a file
    if (lower.includes('create') && lower.includes('file')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: 'To create a file, please specify:\n• Repository name\n• File path\n• File content\n\nExample: "Create a README.md file in my test-repo with content Hello World"',
          suggestions: ['List my repositories first', 'Create README.md', 'Create index.html']
        })
      };
    }

    // Search code
    if (lower.includes('search')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          reply: 'To search code, please specify what you\'re looking for.\n\nExample: "Search for useState in my React projects"',
          suggestions: ['Search in all repos', 'Search in specific repo', 'List repositories']
        })
      };
    }

    // Default response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        reply: `I can help you with GitHub operations. You said: "${message}"\n\nTry one of these commands:`,
        suggestions: ['List my repositories', 'Create a new file', 'Search for code', 'Show recent commits']
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
