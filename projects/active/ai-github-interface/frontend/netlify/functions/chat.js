exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
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
    
    // Use GitHub API directly with your PAT
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.MCP_ACCESS_TOKEN;
    
    // Handle common requests
    if (message.toLowerCase().includes('list my repositories')) {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=10', {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      
      if (response.ok) {
        const repos = await response.json();
        const repoList = repos.map(r => `- ${r.full_name} (${r.private ? 'private' : 'public'})`).join('\n');
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            response: `Here are your most recently updated repositories:\n\n${repoList}`
          })
        };
      }
    }
    
    // Add more GitHub operations as needed
    if (message.toLowerCase().includes('create issue')) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          response: "I can help you create an issue. Please specify: 'create issue in [repo] with title [title] and body [description]'"
        })
      };
    }
    
    // Default response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        response: `I understand you want to: "${message}". I can help with:\n- List my repositories\n- Show recent commits\n- Create issues\n- Check pull requests\n\nWhat would you like to do?`
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to process request',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    };
  }
};
