# ECHO2 Knowledge Repository

This directory serves as the central knowledge repository for ECHO2, containing structured knowledge, frameworks, methodologies, and domain-specific information.

## Directory Structure

```
knowledge/
│
├── memory_graph/                     # Structured knowledge graph (tier-based)
│   ├── README.md                     # Knowledge graph documentation
│   ├── master_index.md               # Master index of all entities 
│   ├── knowledge_graph_optimization_plan.md  # Optimization strategy
│   ├── tier1/                        # Core identity entities
│   ├── tier2/                        # Active project entities
│   ├── tier3/                        # Reference knowledge
│   └── tier4/                        # Archive entities
│
├── content_creation/                 # Content creation frameworks and methodologies
│   └── SEO_Enhanced_Content_Production_Plan.md  # SEO content methodology
│
├── domain_specific/                  # Domain-specific knowledge by category
│   ├── insurance/                    # Insurance industry knowledge
│   ├── automotive/                   # Automotive industry knowledge
│   └── technology/                   # Technology-related knowledge
│
└── reference/                        # Reference materials and information
    ├── tools/                        # Tool references and documentation
    └── external/                     # External resources and references
```

## Knowledge Management

### Memory Graph System

The memory graph system is the core knowledge persistence mechanism for ECHO2. It uses a tier-based approach to organize knowledge efficiently:

- **Tier 1**: Core identity entities (always loaded)
- **Tier 2**: Active project entities (loaded for specific projects)
- **Tier 3**: Reference knowledge (loaded on demand)
- **Tier 4**: Archive entities (historical reference)

For complete details, see the [Memory Graph README](memory_graph/README.md).

### Content Frameworks

The content creation frameworks provide structured methodologies for creating and organizing content:

- [SEO-Enhanced Content Production Plan](content_creation/SEO_Enhanced_Content_Production_Plan.md): Four-phase approach to creating enhanced SEO content

### Domain Knowledge

Domain-specific knowledge is organized by industry or field, providing context-specific information for specialized tasks. This information is used to support client projects and ensure accuracy in specialized domains.

## Usage Guidelines

1. **Accessing Knowledge**:
   - Use the Memory Graph system for structured entity knowledge
   - Reference content frameworks for methodology guidance
   - Consult domain-specific knowledge for field expertise

2. **Contributing Knowledge**:
   - Follow the tier-based organization for memory graph entities
   - Use consistent formatting and structure for all knowledge
   - Include clear categorization and relationships

3. **Knowledge Maintenance**:
   - Regularly update core entities and active projects
   - Archive completed projects appropriately
   - Validate relationship integrity across the knowledge graph

## Integration with Other Systems

The knowledge repository integrates with:
- GitHub for persistent storage
- MCP tools for knowledge management
- Client projects for applied knowledge

For detailed information on how knowledge is applied to specific projects, see the relevant project documentation in the clients directory.

Last Updated: March 26, 2025
