#!/bin/bash

# Create new directory structure
mkdir -p .system/{config,workspace,startup}
mkdir -p docs/{technical,website,schemas}
mkdir -p knowledge/{personal,project,domain,system}
mkdir -p code/{examples,tools,tests}
mkdir -p logs/{session,changes,communications}

# Move configuration files
mv config/* .system/config/ 2>/dev/null
mv Setup/* .system/startup/ 2>/dev/null
mv .system/workspace_control/* .system/workspace/ 2>/dev/null

# Move documentation
mv documentation-site-template/* docs/website/ 2>/dev/null
mv website-structure/* docs/website/ 2>/dev/null
mv docs/schemas/* docs/schemas/ 2>/dev/null

# Move knowledge bases
mv "Personal Knowledge"/* knowledge/personal/ 2>/dev/null
mv "Project Knowledge"/* knowledge/project/ 2>/dev/null
mv "Sprayfoam Knowledge"/* knowledge/domain/ 2>/dev/null
mv knowledge_base/* knowledge/system/ 2>/dev/null

# Move code
mv "Code Examples"/* code/examples/ 2>/dev/null

# Create new documentation files
cat > README.md << 'EOL'
# ECHO2 System

## Directory Structure

### .system/
- System management and control
- Configuration files
- Workspace management
- Startup procedures

### docs/
- Technical documentation
- Website templates and structure
- JSON schemas

### knowledge/
- Personal knowledge and insights
- Project-specific knowledge
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
3. Review knowledge/system for documentation

## Maintenance
- All changes are tracked in logs/changes
- System configuration in .system/config
- Documentation in docs/technical
EOL

# Clean up empty directories
find . -type d -empty -delete

# Add and commit changes
git add .
git commit -m "REORGANIZE: Implement new directory structure
- Consolidated configuration files
- Reorganized documentation
- Unified knowledge bases
- Centralized code storage
- Created logging structure"