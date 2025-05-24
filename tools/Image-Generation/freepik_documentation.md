# Freepik MCP Tool Documentation

## Overview
The Freepik MCP tool provides AI image generation capabilities through Freepik's API services. This tool allows Echo to generate high-quality images based on text prompts with various customization options.

## Configuration
- **Server Location**: `C:\Users\mikec\OneDrive\Documents\Cline\MCP\freepik-mcp\build`
- **API Key**: Environment variable `FREEPIK_API_KEY` required
- **Server Name**: `freepik` (shown in MCP interface)

## Available Functions

### 1. `generate_image` (or possibly `generate_Image` with capital I)

Generates an image based on the provided parameters.

#### Parameters:
- **prompt** (string, required): Description of the image to generate
- **resolution** (string, optional): Image resolution, options: `"2k"` or `"4k"`
- **aspect_ratio** (string, optional): Image aspect ratio, options:
  - `"square_1_1"`
  - `"classic_4_3"`
  - `"traditional_3_4"`
  - `"widescreen_16_9"`
  - `"social_story_9_16"`
- **structure_reference** (string, optional): Base64 encoded image for structure reference
- **style_reference** (string, optional): Base64 encoded image for style reference
- **realism** (boolean, optional): Enable extra realism boost
- **engine** (string, optional): Generation engine, options:
  - `"automatic"`
  - `"magnific_illusio"`
  - `"magnific_sharpy"`
  - `"magnific_sparkle"`
- **creative_detailing** (number, optional): Detail level (0-100)
- **filter_nsfw** (boolean, optional): Enable NSFW filtering

#### Returns:
- **task_id**: Identifier used to check the status of the generation process
- **status**: Initial status (typically "CREATED")
- **generated**: Empty array initially

### 2. `check_status`

Checks the status of an image generation task.

#### Parameters:
- **task_id** (string, required): The task ID returned from `generate_image`

#### Returns:
- **task_id**: The task ID provided
- **status**: Current status of the generation task (e.g., "COMPLETED")
- **generated**: Array of URLs to the generated images when the task is complete
- **has_nsfw**: Array of boolean values indicating whether generated images contain NSFW content

## Usage Workflow

1. Call `generate_image` with desired parameters to receive a task_id
2. Use `check_status` with the task_id to monitor generation progress
3. Once status is "COMPLETED", retrieve the generated image URLs from the response

## Example Usage (From Visual Studio Example)

```javascript
// Step 1: Generate image
const generateResult = await generate_Image({
  prompt: "A cute robotic rubber duck toy, metallic and shiny with glowing blue eyes, sitting in a playful pose",
  resolution: "2k",
  aspect_ratio: "square_1_1",
  realism: true,
  engine: "magnific_sharpy",
  creative_detailing: 50
});

// Response will look like:
// {
//   "data": {
//     "task_id": "7bd1c79d-26d5-48cc-a6d9-7752fc09ab19",
//     "status": "CREATED",
//     "generated": []
//   }
// }

const taskId = generateResult.data.task_id;

// Step 2: Check status
const statusResult = await check_status({
  task_id: taskId
});

// Response when complete will look like:
// {
//   "data": {
//     "task_id": "7bd1c79d-26d5-48cc-a6d9-7752fc09ab19",
//     "status": "COMPLETED",
//     "generated": [
//       "https://ai-statics.freepik.com/content/mg-upscaler/repbgvdfxfh4ddbret4saw5aqu/output.png?token=exp=1742153793~hmac=9112955719cd4f0b80defee30e5a3b4c"
//     ],
//     "has_nsfw": [
//       false
//     ]
//   }
// }

// Step 3: Use the generated image URL
const imageUrl = statusResult.data.generated[0];
```

## Troubleshooting

If you encounter issues with the Freepik MCP tool:

1. Verify the API key is correctly set in environment variables
2. Check that the MCP server is running (shown as "running" in the MCP interface)
3. Ensure parameters match the expected format and types
4. For errors related to content policy, try modifying the prompt or enabling NSFW filtering
5. Try both `generate_image` and `generate_Image` (with capital I) as function names
6. Ensure you're checking the response structure correctly - responses are wrapped in a `data` object
7. Note that the MCP server implementation might differ between Claude and Visual Studio Code environments
8. If using in Claude, ensure the function is properly registered with the correct MCP protocol

## Integration Status
As of March 15, 2025: Function names may vary between environments. Testing is required to determine the correct function names in each context.

## Last Updated
March 15, 2025

@memory_type reference
@importance high
@context image-generation