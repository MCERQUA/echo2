# Echo Knowledge Graph

This directory contains the structured knowledge graph for Echo, organized using a tier-based architecture to optimize loading and access patterns.

## Directory Structure

```
knowledge/memory_graph/
│
├── master_index.md            # Master index of all entities with search directives
├── knowledge_graph_optimization_plan.md  # Plan for ongoing optimization
│
├── tier1/                     # Core identity entities (always loaded)
│   └── core_entities.md       # Core identity entity definitions
│
├── tier2/                     # Active project entities (loaded for specific projects)
│   └── active_projects.md     # Active project definitions
│
├── tier3/                     # Reference knowledge (loaded on demand)
│   └── ...                    # Future reference knowledge documents
│
└── tier4/                     # Archive entities (historical context)
    └── ...                    # Future archived entity documents
```

## Knowledge Graph Overview

The Echo knowledge graph is a structured representation of all information and relationships essential to Echo's operation. It is organized into tiers to optimize loading efficiency and maintain context boundaries.

### Tier-Based Organization

1. **Tier 1: Core Identity**
   - Essential identity information always loaded during initialization
   - Limited to 7-8 core entities with tight relationship mapping
   - Critical for maintaining consistent identity across sessions

2. **Tier 2: Active Projects**
   - Current project entities loaded during project-specific initialization
   - Updated frequently with latest status and task information
   - Contains client-specific knowledge and project details

3. **Tier 3: Reference Knowledge**
   - Technical documentation, frameworks, and support information
   - Loaded on demand when specific knowledge is required
   - Contains reusable patterns and methodology definitions

4. **Tier 4: Archive**
   - Historical information and completed projects
   - Preserved for reference but rarely loaded
   - Provides continuity and learning from past experiences

## Usage Guidelines

### Knowledge Graph Access

- Use `read_graph()` to load the full knowledge graph when needed
- Use `search_nodes("query")` to find specific information
- Use `open_nodes(["Entity1", "Entity2"])` to load specific entities

### Entity Management

- Keep entities focused on a specific concept or project
- Split entities when they grow beyond 15-20 observations
- Maintain clear relationship mapping between entities
- Always include timestamps for new observations

### Knowledge Graph Maintenance

- Follow the maintenance schedule in master_index.md
- Update Tier 1 and Tier 2 entities promptly when information changes
- Archive completed projects to Tier 4 when no longer active
- Run consistency checks to ensure relationship integrity

## Implementation Notes

This organized knowledge graph structure was implemented on March 26, 2025, to address scaling issues with the previous single-file approach. The tier-based organization provides better performance and clearer organization of knowledge.

See `knowledge_graph_optimization_plan.md` for complete details on the optimization strategy.

Last Updated: March 26, 2025
