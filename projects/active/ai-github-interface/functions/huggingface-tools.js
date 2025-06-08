// Hugging Face tool implementations for the worker
// This module handles all Hugging Face API interactions

// Popular Hugging Face Spaces that offer free inference
const HF_SPACES = {
  // Image Generation
  'flux-schnell': {
    url: 'https://black-forest-labs-flux-1-schnell.hf.space',
    api: '/api/predict',
    model: 'FLUX.1-schnell'
  },
  'stable-diffusion-xl': {
    url: 'https://stable-diffusion-xl.hf.space', 
    api: '/api/predict',
    model: 'SDXL'
  },
  'playground-v2': {
    url: 'https://playgroundai-playground-v2-5-1024px-aesthetic.hf.space',
    api: '/api/predict',
    model: 'Playground v2.5'
  },
  
  // Document/Image Analysis
  'qwen-vl': {
    url: 'https://qwen-qwen2-vl-7b-instruct.hf.space',
    api: '/api/predict',
    model: 'Qwen2-VL'
  },
  
  // Text Generation
  'mixtral': {
    url: 'https://mistral-community-mixtral-8x22b-v0-1.hf.space',
    api: '/api/predict', 
    model: 'Mixtral-8x22B'
  }
};

// Function to call Hugging Face Spaces
export async function callHuggingFaceSpace(spaceId, payload) {
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

// Function to convert image URL to base64
export async function imageUrlToBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return null;
  }
}

// Function to search Hugging Face models
export async function searchHuggingFaceModels(task, limit = 5, sort = 'likes') {
  const response = await fetch(
    `https://huggingface.co/api/models?pipeline_tag=${task}&sort=${sort}&limit=${limit}`,
    {
      headers: {
        'Accept': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to search Hugging Face models');
  }

  const models = await response.json();
  
  return models.map(model => ({
    id: model.id,
    likes: model.likes || 0,
    downloads: model.downloads || 0,
    lastModified: model.lastModified,
    tags: model.tags || [],
    hasSpace: model.spaces && model.spaces.length > 0
  }));
}

// Main Hugging Face tool executor
export async function executeHuggingFaceTool(env, toolName, args) {
  switch (toolName) {
    case 'generate_image': {
      const { prompt, model = 'flux-schnell', width = 1024, height = 1024, save_to_github, github_path } = args;
      
      try {
        // Call the appropriate space based on model selection
        let spaceId = model;
        if (!HF_SPACES[spaceId]) {
          // Map common model names to spaces
          const modelMap = {
            'flux': 'flux-schnell',
            'stable-diffusion': 'stable-diffusion-xl',
            'sdxl': 'stable-diffusion-xl',
            'playground': 'playground-v2'
          };
          spaceId = modelMap[model] || 'flux-schnell';
        }

        // Generate the image
        const result = await callHuggingFaceSpace(spaceId, {
          prompt,
          width,
          height
        });

        // Extract image URL from result
        let imageUrl = null;
        let imageBase64 = null;
        
        if (result && result[0]) {
          if (typeof result[0] === 'string' && result[0].startsWith('http')) {
            imageUrl = result[0];
            imageBase64 = await imageUrlToBase64(imageUrl);
          } else if (result[0].url) {
            imageUrl = result[0].url;
            imageBase64 = await imageUrlToBase64(imageUrl);
          }
        }

        // Save to GitHub if requested
        let githubResult = null;
        if (save_to_github && github_path && imageBase64 && env.GITHUB_TOKEN) {
          const pathParts = github_path.split('/');
          const owner = pathParts[0];
          const repo = pathParts[1];
          const filePath = pathParts.slice(2).join('/');
          
          githubResult = await executeGitHubTool(env.GITHUB_TOKEN, 'create_or_update_file', {
            owner,
            repo,
            path: filePath,
            content: imageBase64,
            message: `Add AI-generated image: ${prompt.substring(0, 50)}...`,
            branch: 'main'
          });
        }

        return {
          success: true,
          model: HF_SPACES[spaceId].model,
          spaceId,
          prompt,
          image_url: imageUrl,
          image_base64: imageBase64 ? `data:image/png;base64,${imageBase64}` : null,
          github_saved: !!githubResult,
          github_url: githubResult?.content?.html_url
        };
        
      } catch (error) {
        return {
          success: false,
          error: error.message,
          model,
          prompt
        };
      }
    }

    case 'generate_multiple_images': {
      const { prompt, models_count = 3, save_to_github, github_folder } = args;
      
      const availableModels = ['flux-schnell', 'stable-diffusion-xl', 'playground-v2'];
      const modelsToUse = availableModels.slice(0, models_count);
      const results = [];
      
      for (const modelId of modelsToUse) {
        const result = await executeHuggingFaceTool(env, 'generate_image', {
          prompt,
          model: modelId,
          save_to_github,
          github_path: save_to_github ? `${github_folder}/${modelId}-${Date.now()}.png` : null
        });
        results.push(result);
        
        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      return {
        prompt,
        models_used: modelsToUse.map(id => HF_SPACES[id].model),
        results,
        success_count: results.filter(r => r.success).length
      };
    }

    case 'analyze_image': {
      const { image_url, question = "What's in this image?", task = 'describe' } = args;
      
      try {
        // Use Qwen-VL for image analysis
        const result = await callHuggingFaceSpace('qwen-vl', {
          inputs: `${question}\n<image>${image_url}</image>`,
          fn_index: 0
        });
        
        return {
          success: true,
          image_url,
          task,
          question,
          analysis: result[0] || 'Unable to analyze image',
          model: 'Qwen2-VL-7B'
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          image_url,
          question
        };
      }
    }

    case 'search_ai_models': {
      const { task, limit = 5, sort_by = 'likes' } = args;
      
      try {
        const models = await searchHuggingFaceModels(task, limit, sort_by);
        
        return {
          success: true,
          task,
          count: models.length,
          models,
          sort_by
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          task
        };
      }
    }

    default:
      throw new Error(`Unknown Hugging Face tool: ${toolName}`);
  }
}

// Import the GitHub tool executor from the main worker
async function executeGitHubTool(token, toolName, args) {
  // This is imported from the main worker file
  // Placeholder for the import
  const { executeGitHubTool: gitHubExecutor } = await import('./_worker.js');
  return gitHubExecutor(token, toolName, args);
}
