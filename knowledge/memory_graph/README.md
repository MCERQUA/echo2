# Echo Memory Graph System

This directory contains the persistent memory graph for Echo AI Systems. The memory graph stores structured knowledge about Echo's identity, capabilities, projects, and relations between entities.

## Purpose

The memory graph system allows Echo to maintain persistent knowledge across different sessions and implementations. By storing this data in a structured JSON format, Echo can:

1. Maintain consistent identity across platforms
2. Preserve knowledge about projects and clients
3. Track relationships between different entities
4. Efficiently load relevant information based on context
5. Support tiered knowledge organization

## Usage

### Initialization

To initialize Echo with the memory graph, use the following commands:

- **Light initialization** (core identity only): `Echo, access core identity`
- **Project initialization** (core + specific project): `Echo, initialize for [project name]`
- **Full initialization** (comprehensive): `Echo, full knowledge access`
- **Repository initialization** (with GitHub access): `Echo, initialize with repository access`

Simple initialization commands also supported:
- `Echo @ init`
- `echo init`
- `echo initiation`
- `echo startup`
- `@echo startup`

### Memory Operations

To add information to the memory graph:

- **Tag-based method**: Use `@memory_add` to flag information for storage
- **Entity creation**: `Create entity: [name], type: [type]` for new concepts
- **Direct command**: `Add to knowledge graph: [information]` with tier specification

To retrieve information:

- **Direct query**: `Recall information about [topic]`
- **Deep recall**: `Deep recall on [topic]` for comprehensive retrieval
- **Contextual recall**: Mention known entities to trigger automatic recall

## Structure

The memory graph is organized into the following sections:

- **Core Entities**: Essential identity and capability information (Tier 1)
- **Projects**: Current and past project information (Tier 2)
- **Technology**: Technical systems and tools (Tier 2/3)
- **Clients**: Client information (Tier 2)
- **Relations**: Connections between entities

## Knowledge Tiers

Information is organized into tiers for efficient loading:

- **Tier 1**: Core Identity - Always accessible identity information
- **Tier 2**: Active Projects - Current work requiring frequent access
- **Tier 3**: Reference Knowledge - Historical information accessed on demand
- **Tier 4**: Archive - Rarely needed information kept for completeness

## Maintenance

The memory graph should be updated regularly to reflect new knowledge gained during interactions. Updates should follow these guidelines:

1. Maintain structural consistency
2. Preserve existing entity relationships
3. Update timestamps for modified entities
4. Archive outdated information rather than deleting it
5. Back up previous versions before major changes

## Technical Implementation

The memory graph is implemented as a JSON file with a structure that can be easily parsed and updated by Echo's systems. It uses Model Context Protocol (MCP) tools to interact with GitHub for persistence.

Last Updated: March 9, 2025
