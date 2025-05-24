# Knowledge Graph Master Index

This file serves as the central index for all entities in the knowledge graph, organized by tier. It is designed to facilitate quick lookups and entity discovery.

## Index Structure

This index follows a tiered structure for organization:
- **Tier 1**: Core identity entities (always loaded)
- **Tier 2**: Active project entities (loaded for specific projects)
- **Tier 3**: Reference knowledge entities (loaded on demand)
- **Tier 4**: Archive entities (retained for historical context)

## Tier 1: Core Identity Entities

| Entity Name | Entity Type | Last Updated | Key Relationships | File Location |
|-------------|-------------|--------------|-------------------|---------------|
| Echo_Core_Identity | System | 2025-03-26 | implements:Echo_Capabilities, founded:Echo_Systems_Business | tier1/core_identity.json |
| Echo_Capabilities | System | 2025-03-24 | includes:GitHub_Integration, uses:Memory_System | tier1/capabilities.json |
| Echo_Knowledge_Tiers | System | 2025-03-26 | categorizes:Projects | tier1/knowledge_tiers.json |
| Echo_Implementation_Spaces | System | 2025-03-18 | includes:Educational_AI_Space | tier1/implementation_spaces.json |
| Echo_Systems_Business | Business | 2025-03-17 | serves:Josh_Client, manages:Projects | tier1/business.json |
| Memory_System | System | 2025-03-26 | organizes:Echo_Knowledge_Tiers | tier1/memory_system.json |
| Initialization_Process | Process | 2025-03-15 | loads:Echo_Knowledge_Tiers | tier1/initialization.json |
| GitHub_Integration | System | 2025-03-20 | maintains:Repositories | tier1/github_integration.json |
| Development_Protocols | Process | 2025-03-15 | guides:Projects | tier1/development_protocols.json |

## Tier 2: Active Project Entities

| Entity Name | Entity Type | Last Updated | Key Relationships | File Location |
|-------------|-------------|--------------|-------------------|---------------|
| Domain_Portfolio_Management | Project | 2025-03-26 | developed_for:Josh_Client | tier2/domain_portfolio.json |
| Muscle_Car_Blogs_Project | Project | 2025-03-26 | implements:SEO_Content_Generator | tier2/muscle_car_blogs.json |
| Insulation_Contractors_Arizona | Project | 2025-03-26 | owned_by:Josh_Client | tier2/insulation_contractors.json |
| HairPHD_Salon_Project | Project | 2025-03-17 | implements:Website_Template_System | tier2/hairphd_salon.json |
| AI_Phone_System | Project | 2025-03-20 | developed_for:Josh_Client | tier2/ai_phone_system.json |
| Spatial_SDK_Documentation | Project | 2025-03-23 | uses:GitHub_Integration | tier2/spatial_sdk_docs.json |
| Unity_MCP_Test_Project | Project | 2025-03-18 | uses:Echo_MCP_Tools | tier2/unity_mcp_test.json |
| Josh_Client | Client | 2025-03-26 | owns:Projects | tier2/josh_client.json |

## Tier 3: Reference Knowledge Entities

| Entity Name | Entity Type | Last Updated | Key Relationships | File Location |
|-------------|-------------|--------------|-------------------|---------------|
| Echo_MCP_Tools | System | 2025-03-24 | updates:Echo_MCP_Tools_Updated | tier3/mcp_tools.json |
| Echo_MCP_Tools_Updated | System | 2025-03-24 | enhances:Echo_Capabilities | tier3/mcp_tools_updated.json |
| Technology_Stack | System | 2025-03-17 | used_by:Echo_Systems_Business | tier3/technology_stack.json |
| SEO_Enhanced_Content_Production_Plan | Framework | 2025-03-25 | guides:Muscle_Car_Blogs_Project | tier3/seo_plan.json |
| Website_Template_System | Project | 2025-03-15 | implements:Technology_Stack | tier3/website_template_system.json |
| Model_Context_Protocol | Technology | 2025-03-15 | enables:Echo_MCP_Tools | tier3/model_context_protocol.json |
| Educational_AI_Space | Project | 2025-03-17 | showcases:Technology_Stack | tier3/educational_ai_space.json |

## Tier 4: Technical Component Entities

| Entity Name | Entity Type | Last Updated | Key Relationships | File Location |
|-------------|-------------|--------------|-------------------|---------------|
| Space Service | SpatialService | 2025-03-23 | includes:TeleportToSpace | tier4/space_service.json |
| TeleportToSpace | SpatialComponent | 2025-03-23 | introduced_in:Creator_Toolkit_v1.58 | tier4/teleport_to_space.json |
| TeleportToSpaceNode | SpatialVisualScriptingNode | 2025-03-23 | implements:TeleportToSpace | tier4/teleport_to_space_node.json |
| spaceService.TeleportToSpace | SpatialComponent | 2025-03-23 | component_of:Space_Service | tier4/space_service_teleport.json |
| Creator Toolkit v1.58 | SpatialVersion | 2025-03-23 | introduced:TeleportToSpace | tier4/creator_toolkit_v1.58.json |
| PeriodicCurrencyRewarder | SpatialComponent | 2025-03-23 | uses:AwardWorldCurrencyRequest | tier4/periodic_currency_rewarder.json |
| AwardWorldCurrencyRequest | SpatialSDKComponent | 2025-03-23 | used_by:PeriodicCurrencyRewarder | tier4/award_world_currency_request.json |
| DoorwayPortal | SpatialComponent | 2025-03-23 | uses:TeleportToSpace | tier4/doorway_portal.json |

## Search Directives

To efficiently locate information in the knowledge graph:

1. **Entity Name Search**: Exact match on entity name
   - Example: `search_nodes("Domain_Portfolio_Management")`

2. **Type-Based Search**: Find all entities of a specific type
   - Example: `search_nodes("entityType:Project")`

3. **Relationship Search**: Find entities with specific relationships
   - Example: `search_nodes("relationType:implements")`

4. **Content Search**: Search within observations
   - Example: `search_nodes("553 domains")`

5. **Combined Search**: Multiple conditions with logical operators
   - Example: `search_nodes("entityType:Project AND Josh")`

## Maintenance Schedule

- **Daily**: Update active project entities (Tier 2)
- **Weekly**: Full knowledge graph consistency check
- **Monthly**: Archive outdated entities to Tier 4
- **Quarterly**: Complete knowledge graph restructuring evaluation

## Best Practices

1. Always update the Last Updated timestamp when modifying entities
2. Maintain bidirectional relationships between entities
3. Keep observations concise and information-dense
4. Split entities when they exceed 15-20 observations
5. Use clear naming conventions for all new entities

Last Updated: March 26, 2025
