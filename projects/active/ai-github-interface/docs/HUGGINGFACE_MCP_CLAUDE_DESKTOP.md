# Hugging Face MCP Server for Claude Desktop

This allows you to test the same Hugging Face tools locally in Claude Desktop that are integrated into echo2.pages.dev.

## Installation

### 1. Create the MCP Server File

Create a new file called `huggingface-mcp-server.js` in your preferred location (e.g., `~/mcp-servers/`):

```javascript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch';

// Hugging Face Spaces configuration
const HF_SPACES = {
  'flux-schnell': {
    url: 'https://black-forest-labs-flux-1-schnell.hf.space',
    api: '/api/predict',
    model: 'FLUX.1-schnell'
  },
  'stable-diffusion-xl': {
    url: 'https://stabilityai-stable-diffusion-xl-base-1-0.hf.space',
    api: '/api/predict',
    model: 'SDXL'
  },
  'playground-v2': {
    url: 'https://playgroundai-playground-v2-5-1024px-aesthetic.hf.space',
    api: '/api/predict',
    model: 'Playground v2.5'
  }
};

// Helper function to call HF Spaces
async function callHuggingFaceSpace(spaceId, payload) {
  const space = HF_SPACES[spaceId];
  if (!space) {
    throw new Error(`Unknown space: ${spaceId}`);
  }

  try {
    const response = await fetch(`${space.url}${space.api}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [payload.prompt || payload.inputs],
        fn_index: payload.fn_index || 0
      })
    });

    if (!response.ok) {
      throw new Error(`Space API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error(`Error calling ${spaceId}:`, error);
    throw error;
  }
}

// Create MCP server
const server = new Server(
  {
    name: 'huggingface-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_image',
        description: 'Generate an image using AI models like FLUX or Stable Diffusion',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Text description of the image to generate',
            },
            model: {
              type: 'string',
              enum: ['flux-schnell', 'stable-diffusion-xl', 'playground-v2'],
              description: 'AI model to use',
              default: 'flux-schnell',
            },
            width: {
              type: 'number',
              description: 'Image width in pixels',
              default: 1024,
            },
            height: {
              type: 'number',
              description: 'Image height in pixels',
              default: 1024,
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'generate_multiple_images',
        description: 'Generate the same image using multiple AI models for comparison',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Text description of the image',
            },
            models_count: {
              type: 'number',
              description: 'Number of models to use (2-3)',
              default: 3,
              minimum: 2,
              maximum: 3,
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'search_ai_models',
        description: 'Search Hugging Face Hub for popular AI models',
        inputSchema: {
          type: 'object',
          properties: {
            task: {
              type: 'string',
              enum: ['text-to-image', 'image-to-text', 'text-generation'],
              description: 'Type of AI task',
            },
            limit: {
              type: 'number',
              description: 'Number of models to return',
              default: 5,
            },
          },
          required: ['task'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'generate_image': {
      const { prompt, model = 'flux-schnell', width = 1024, height = 1024 } = args;
      
      try {
        console.log(`Generating image with ${model}: ${prompt}`);
        
        // For testing, return a placeholder response
        // In production, this would call the actual HF Space
        return {
          content: [
            {
              type: 'text',
              text: `Generated image using ${HF_SPACES[model].model}:\n` +
                    `Prompt: "${prompt}"\n` +
                    `Size: ${width}x${height}\n` +
                    `Status: Success\n` +
                    `Note: In production, this would return an actual image URL.`
            }
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error generating image: ${error.message}`
            }
          ],
        };
      }
    }

    case 'generate_multiple_images': {
      const { prompt, models_count = 3 } = args;
      const models = Object.keys(HF_SPACES).slice(0, models_count);
      
      try {
        const results = models.map(model => 
          `${HF_SPACES[model].model}: Generated successfully`
        ).join('\n');
        
        return {
          content: [
            {
              type: 'text',
              text: `Generated ${models_count} variations of: "${prompt}"\n\n${results}`
            }
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error generating multiple images: ${error.message}`
            }
          ],
        };
      }
    }

    case 'search_ai_models': {
      const { task, limit = 5 } = args;
      
      try {
        // Mock response for testing
        const mockModels = {
          'text-to-image': [
            'black-forest-labs/FLUX.1-schnell (234K likes)',
            'stabilityai/stable-diffusion-xl-base-1.0 (189K likes)',
            'runwayml/stable-diffusion-v1-5 (167K likes)',
            'CompVis/stable-diffusion-v1-4 (145K likes)',
            'prompthero/openjourney (132K likes)'
          ],
          'image-to-text': [
            'Salesforce/blip-image-captioning-large (45K likes)',
            'nlpconnect/vit-gpt2-image-captioning (38K likes)',
            'microsoft/git-large-coco (29K likes)'
          ],
          'text-generation': [
            'meta-llama/Llama-2-70b-chat-hf (567K likes)',
            'mistralai/Mixtral-8x7B-Instruct-v0.1 (234K likes)',
            'tiiuae/falcon-40b-instruct (198K likes)'
          ]
        };
        
        const models = mockModels[task] || [];
        const topModels = models.slice(0, limit);
        
        return {
          content: [
            {
              type: 'text',
              text: `Top ${limit} ${task} models on Hugging Face:\n\n${topModels.join('\n')}`
            }
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error searching models: ${error.message}`
            }
          ],
        };
      }
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Hugging Face MCP server running on stdio');
```

### 2. Create package.json

In the same directory, create `package.json`:

```json
{
  "name": "huggingface-mcp-server",
  "version": "1.0.0",
  "description": "MCP server for Hugging Face integration",
  "type": "module",
  "main": "huggingface-mcp-server.js",
  "scripts": {
    "start": "node huggingface-mcp-server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0",
    "node-fetch": "^3.3.2"
  }
}
```

### 3. Install Dependencies

```bash
cd ~/mcp-servers/huggingface-mcp
npm install
```

### 4. Make Executable

```bash
chmod +x huggingface-mcp-server.js
```

## Configure Claude Desktop

Add this to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "huggingface": {
      "command": "node",
      "args": ["/Users/YOUR_USERNAME/mcp-servers/huggingface-mcp/huggingface-mcp-server.js"],
      "env": {}
    }
  }
}
```

Or if you want to use npx (easier):

```json
{
  "mcpServers": {
    "huggingface": {
      "command": "npx",
      "args": ["-y", "@your-username/huggingface-mcp-server"]
    }
  }
}
```

## Testing in Claude Desktop

Once configured, restart Claude Desktop and try these commands:

1. **Basic Image Generation**:
   ```
   Use the generate_image tool to create an image of a futuristic robot
   ```

2. **Multiple Models**:
   ```
   Use generate_multiple_images to create a cyberpunk city with 3 different models
   ```

3. **Model Search**:
   ```
   Use search_ai_models to find the top 5 text-to-image models
   ```

## Full Production Version

For a production version that actually generates images, update the generate_image case:

```javascript
case 'generate_image': {
  const { prompt, model = 'flux-schnell', width = 1024, height = 1024 } = args;
  
  try {
    // Call actual HF Space
    const result = await callHuggingFaceSpace(model, {
      prompt,
      width,
      height
    });
    
    // Extract image URL
    let imageUrl = null;
    if (result && result[0]) {
      if (typeof result[0] === 'string' && result[0].startsWith('http')) {
        imageUrl = result[0];
      } else if (result[0].url) {
        imageUrl = result[0].url;
      }
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Generated image using ${HF_SPACES[model].model}:\n` +
                `Prompt: "${prompt}"\n` +
                `Image URL: ${imageUrl || 'Generation in progress...'}`
        }
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error generating image: ${error.message}`
        }
      ],
    };
  }
}
```

## Notes

- This MCP server provides the same tools as your echo2.pages.dev integration
- The test version returns mock data to verify the tools work
- The production version would actually call Hugging Face Spaces
- You can extend this with more models and capabilities
- Consider adding caching to avoid repeated API calls

This setup lets you test the exact same Hugging Face tools locally in Claude Desktop before deploying to your website!
