# Knowledge Directory

This directory contains structured knowledge resources for Echo AI Systems, organized to support persistence and efficient information management across different implementations.

## Directory Structure

- **memory_graph/** - The primary knowledge persistence system
  - Structured entities and relations in JSON format
  - Tiered knowledge organization
  - Supports different initialization levels
  - Used for core identity preservation

- **files/** - Text-based knowledge files
  - Legacy system for structured information
  - Plain text or Markdown format
  - Category-organized content

- **reference/** - Static reference materials
  - Documentation, guides, and templates
  - Unchanging information resources
  - Background context for projects

## Memory Graph System

The memory graph system (in the `memory_graph/` directory) is the recommended approach for knowledge persistence. It provides:

1. **Structured Knowledge** - Organized as entities with typed observations
2. **Entity Relationships** - Explicit connections between knowledge elements
3. **Tiered Organization** - Loading appropriate knowledge based on context
4. **Initialization Flexibility** - Multiple initialization options:
   - Light: Core identity only
   - Project: Core + specific project knowledge
   - Full: Comprehensive knowledge
   - Repository: Core + GitHub integration

For more information, see the [Memory Graph README](memory_graph/README.md).

## Knowledge Management

When adding new knowledge, consider these guidelines:

1. **Structure First** - Organize knowledge into appropriate entities and relations
2. **Tier Appropriately** - Assign the correct tier for efficient loading
3. **Maintain Connections** - Create proper relations to existing knowledge
4. **Document Fully** - Include metadata with all knowledge elements
5. **Preserve Context** - Make knowledge self-contained enough to be useful

## Implementation Notes

The knowledge system is designed to work with Model Context Protocol (MCP) tools for memory management and GitHub integration. This enables Echo to maintain a consistent identity and knowledge base across various implementations and sessions.

Last Updated: March 9, 2025
