# Image Generation Tools

This directory contains documentation and reference materials for image generation tools available to Echo through MCP.

## Available Tools

### [Freepik MCP Tool](freepik_documentation.md)
Provides AI image generation capabilities through Freepik's API services. Allows for generating high-quality images based on text prompts with various customization options including resolution, aspect ratio, style, and more.

## General Usage Notes

- Image generation tools typically use a two-step process:
  1. Submit generation request with parameters
  2. Check status until completion
  
- Consider potential rate limiting when making multiple requests
- Be mindful of prompt engineering best practices for optimal results
- Store generated image URLs or references when needed for future use

## Adding New Tools

When adding documentation for new image generation tools, please include:

1. Overview of the tool's capabilities
2. Required configuration and API keys
3. Available functions with parameter details
4. Example usage with code snippets
5. Troubleshooting tips
6. Last updated timestamp

@memory_type reference
@importance medium
@context image-generation