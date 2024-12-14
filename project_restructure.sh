#!/bin/bash

# Create projects directory structure
mkdir -p projects/{active,completed,templates}
mkdir -p projects/active/safety_manual
mkdir -p projects/active/documentation_site
mkdir -p projects/templates/basic_structure

# Create project template
cat > projects/templates/basic_structure/README.md << 'EOL'
# Project Template

## Overview
[Brief project description]

## Structure
- /src        - Source code
- /docs       - Project documentation
- /tests      - Test files
- /resources  - Project resources
- /builds     - Build outputs

## Status
- Start Date: [Date]
- Status: [Planning/Active/Completed]
- Current Phase: [Phase]

## Dependencies
[List of project dependencies]

## Team
[Team members and roles]

## Documentation
[Links to relevant documentation]
EOL

# Create project documentation structure
cat > projects/README.md << 'EOL'
# ECHO2 Projects

## Active Projects
Projects currently under development or maintenance.

### Safety Manual Project
- Status: Active
- Description: Comprehensive safety documentation system
- Location: /projects/active/safety_manual

### Documentation Site
- Status: Active
- Description: ECHO2 documentation website
- Location: /projects/active/documentation_site

## Project Management

### Structure
- /active     - Currently active projects
- /completed  - Finished projects (archived)
- /templates  - Project templates and structures

### Project Lifecycle
1. Initialization
   - Copy template from /templates
   - Set up project structure
   - Create initial documentation

2. Development
   - Regular updates
   - Documentation maintenance
   - Progress tracking

3. Completion
   - Final documentation
   - Archive preparation
   - Move to /completed

### Guidelines
- Each project must have a README.md
- Use standard template structure
- Keep documentation updated
- Track progress regularly
EOL

# Move existing project files
mv knowledge/project/Safety_Manual_Project/* projects/active/safety_manual/ 2>/dev/null
mv docs/website/* projects/active/documentation_site/ 2>/dev/null

# Create safety manual project structure
cat > projects/active/safety_manual/README.md << 'EOL'
# Safety Manual Project

## Overview
Comprehensive safety documentation and management system for spray foam applications.

## Components
- Safety Documentation
- Hazard Communication
- Training Materials
- Compliance Guides

## Status
- Start Date: 2024-12-11
- Status: Active
- Current Phase: Documentation Development

## Key Features
- OSHA Compliance
- Industry Best Practices
- Interactive Training
- Documentation Templates

## Progress
- [x] Initial structure
- [x] Base documentation
- [x] Hazard communication
- [ ] Training materials
- [ ] Review system
- [ ] Implementation guide

## Documentation
- Main Manual: safety_manual.txt
- Templates: /templates
- Guides: /guides
EOL

# Create documentation site project structure
cat > projects/active/documentation_site/README.md << 'EOL'
# Documentation Site Project

## Overview
Interactive documentation website for ECHO2 system and knowledge base.

## Components
- Next.js Framework
- MDX Content
- Interactive Components
- Search System

## Status
- Start Date: 2024-12-14
- Status: Active
- Current Phase: Initial Development

## Features
- Dynamic Content Loading
- Interactive Examples
- Search Functionality
- Version Control

## Progress
- [x] Project setup
- [x] Basic structure
- [ ] Content migration
- [ ] Search implementation
- [ ] Interactive components
- [ ] Deployment system

## Technical Stack
- Next.js
- TailwindCSS
- MDX
- TypeScript
EOL

# Update main README to include projects
cat > README.md << 'EOL'
# ECHO2 System

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

### code/
- Code examples
- Tools and utilities
- Test suites

### logs/
- Session logs
- Change logs
- Communication records

## Quick Start
1. Run `.system/startup/unified_startup.py`
2. Check logs/session for current status
3. Review active projects in projects/active

## Project Management
- Active projects in projects/active
- Project templates in projects/templates
- Completed projects archived in projects/completed

## Maintenance
- All changes tracked in logs/changes
- System configuration in .system/config
- Documentation in docs/technical
EOL

# Clean up old directories
rm -rf knowledge/project docs/website

# Add and commit changes
git add .
git commit -m "RESTRUCTURE: Add dedicated projects directory
- Created projects directory structure
- Added project templates
- Moved Safety Manual and Documentation Site to projects
- Updated documentation
- Created project management guidelines"