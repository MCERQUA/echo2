# ECHO2 System

⚠️ IMPORTANT: GitHub is the ONLY Persistent Storage ⚠️
- Every session starts with a completely fresh environment
- Local files in /tmp/ECHO2 are temporary
- Only files committed to GitHub persist between sessions

## Directory Structure  

### .system/
- System management and control
- Configuration files
- Workspace management
- Startup procedures

### projects/
- Active projects
- Completed projects
- Project templates
- Project documentation

### docs/
- Technical documentation
- System documentation
- JSON schemas

### knowledge/
- Personal knowledge and insights
- Domain-specific knowledge
- System and operational knowledge
- Memory graph (tier-based knowledge organization)

### clients/
- Client-specific projects and resources
- Organized by client name
- Contains project documentation and assets

### code/
- Code examples
- Tools and utilities
- Test suites

### logs/
- Session logs
- Change logs
- Communication records

## Knowledge Graph
- Organized in tier-based structure (as of March 26, 2025)
- Tier 1: Core identity entities
- Tier 2: Active project entities
- Tier 3: Reference knowledge
- Tier 4: Archive entities
- See `knowledge/memory_graph/README.md` for complete details

## Quick Start
1. Run `.system/startup/unified_startup.py`
2. Check logs/session for current status
3. Review active projects in projects/active

## Project Management
- Active projects in projects/active
- Project templates in projects/templates
- Completed projects archived in projects/completed
- Client-specific projects in clients/[client_name]/

## Client Projects
- Josh Client: Domains, Muscle Cars, HairPHD, Insulation, Phone System
- Access client projects through clients/[client_name]/ directory

## Maintenance
- All changes tracked in logs/changes
- System configuration in .system/config
- Documentation in docs/technical
- Knowledge graph maintenance guidelines in knowledge/memory_graph/

Last Updated: March 26, 2025
