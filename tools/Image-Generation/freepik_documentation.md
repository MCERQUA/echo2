# Freepik MCP Tool Documentation

## Overview
The Freepik MCP tool provides AI image generation capabilities through Freepik's API services. This tool allows Echo to generate high-quality images based on text prompts with various customization options.

## Configuration
- **Server Location**: `C:\Users\mikec\OneDrive\Documents\Cline\MCP\freepik-mcp\build`
- **API Key**: Environment variable `FREEPIK_API_KEY` required

## Available Functions

### 1. `generate_image`

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

### 2. `check_status`

Checks the status of an image generation task.

#### Parameters:
- **task_id** (string, required): The task ID returned from `generate_image`

#### Returns:
- **status**: Current status of the generation task
- **urls**: URLs to the generated images when the task is complete

## Usage Workflow

1. Call `generate_image` with desired parameters to receive a task_id
2. Use `check_status` with the task_id to monitor generation progress
3. Once status is "complete", retrieve the generated image URLs from the response

## Example Usage

```typescript
// Step 1: Generate image
const generateResult = await generateImage({
  prompt: "beautiful mountain landscape with a lake and sunset",
  resolution: "2k",
  aspect_ratio: "widescreen_16_9",
  engine: "magnific_sharpy",
  creative_detailing: 80,
  filter_nsfw: true
});

const taskId = generateResult.task_id;

// Step 2: Check status periodically until complete
let statusResult;
do {
  statusResult = await checkStatus({ task_id: taskId });
  if (statusResult.status !== "complete") {
    // Wait before checking again
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
} while (statusResult.status !== "complete");

// Step 3: Use the generated image URLs
const imageUrls = statusResult.urls;
console.log("Generated image URLs:", imageUrls);
```

## Troubleshooting

If you encounter issues with the Freepik MCP tool:

1. Verify the API key is correctly set in environment variables
2. Check that the MCP server is running (shown as "running" in the MCP interface)
3. Ensure parameters match the expected format and types
4. For errors related to content policy, try modifying the prompt or enabling NSFW filtering
5. If the function names (`generate_image`, `check_status`) don't work, try alternate variations:
   - `freepik.generate_image`
   - `freepik_generate_image`
   - `freepik_image_generate`
6. The MCP interface might need a refresh or restart to properly register functions
7. Verify in the MCP server logs that the functions are being properly registered

## Integration Status
As of March 15, 2025: Function names documented may not match actual implementation. Testing required to determine correct function names.

## Last Updated
March 15, 2025

@memory_type reference
@importance high
@context image-generation