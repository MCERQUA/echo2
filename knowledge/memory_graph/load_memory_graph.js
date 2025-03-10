/**
 * Echo Memory Graph Loader
 * 
 * This script loads the Echo memory graph from JSON storage and initializes
 * the knowledge system with the appropriate tier of information based on
 * the initialization command.
 * 
 * Usage:
 * - Light initialization: Loads only Tier 1 (Core Identity)
 * - Project initialization: Loads Tier 1 + specified project
 * - Full initialization: Loads all tiers
 * - Repository initialization: Loads Tier 1 + GitHub capabilities
 */

// Configuration
const MEMORY_GRAPH_PATH = 'knowledge/memory_graph/echo_memory_graph.json';
const INITIALIZATION_LEVELS = {
  LIGHT: 'light',
  PROJECT: 'project',
  FULL: 'full',
  REPOSITORY: 'repository'
};

/**
 * Load the memory graph from storage
 * @returns {Promise<Object>} The memory graph data
 */
async function loadMemoryGraph() {
  try {
    // In a Node.js environment, this would use fs module
    // In a browser environment, this would use fetch or XHR
    // Using generic async loading function for demonstration
    const response = await fetch(MEMORY_GRAPH_PATH);
    const data = await response.json();
    console.log('Memory graph loaded successfully');
    return data;
  } catch (error) {
    console.error('Error loading memory graph:', error);
    return null;
  }
}

/**
 * Initialize Echo with appropriate knowledge tiers
 * @param {String} level - Initialization level
 * @param {String} [projectName] - Optional project name for project initialization
 * @returns {Promise<Object>} Loaded knowledge
 */
async function initializeEcho(level, projectName) {
  const memoryGraph = await loadMemoryGraph();
  if (!memoryGraph) return null;
  
  const knowledgeBase = {
    core: {},
    projects: {},
    relations: {}
  };
  
  // Always load core entities (Tier 1)
  knowledgeBase.core = memoryGraph.core_entities.reduce((acc, entity) => {
    acc[entity.name] = entity;
    return acc;
  }, {});
  
  // Load additional knowledge based on initialization level
  switch (level) {
    case INITIALIZATION_LEVELS.LIGHT:
      console.log('Light initialization - Core identity loaded');
      break;
      
    case INITIALIZATION_LEVELS.PROJECT:
      if (projectName) {
        const project = memoryGraph.projects.find(p => 
          p.name.toLowerCase().includes(projectName.toLowerCase())
        );
        
        if (project) {
          knowledgeBase.projects[project.name] = project;
          console.log(`Project initialization - Loaded project: ${project.name}`);
          
          // Load relations for this project
          memoryGraph.relations.forEach(relation => {
            if (relation.from === project.name || relation.to === project.name) {
              if (!knowledgeBase.relations[relation.from]) {
                knowledgeBase.relations[relation.from] = [];
              }
              knowledgeBase.relations[relation.from].push({
                to: relation.to,
                relationType: relation.relationType
              });
            }
          });
        } else {
          console.log(`Project '${projectName}' not found in memory graph`);
        }
      }
      break;
      
    case INITIALIZATION_LEVELS.REPOSITORY:
      // Load GitHub integration knowledge
      const githubEntity = memoryGraph.core_entities.find(e => e.name === 'GitHub_Integration');
      if (githubEntity) {
        knowledgeBase.core['GitHub_Integration'] = githubEntity;
      }
      
      // Load GitHub relations
      memoryGraph.relations.forEach(relation => {
        if (relation.from === 'GitHub_Integration' || relation.to === 'GitHub_Integration') {
          if (!knowledgeBase.relations[relation.from]) {
            knowledgeBase.relations[relation.from] = [];
          }
          knowledgeBase.relations[relation.from].push({
            to: relation.to,
            relationType: relation.relationType
          });
        }
      });
      
      console.log('Repository initialization - GitHub integration capabilities loaded');
      break;
      
    case INITIALIZATION_LEVELS.FULL:
      // Load all projects
      knowledgeBase.projects = memoryGraph.projects.reduce((acc, project) => {
        acc[project.name] = project;
        return acc;
      }, {});
      
      // Load all technology
      knowledgeBase.technology = memoryGraph.technology.reduce((acc, tech) => {
        acc[tech.name] = tech;
        return acc;
      }, {});
      
      // Load all clients
      knowledgeBase.clients = memoryGraph.clients.reduce((acc, client) => {
        acc[client.name] = client;
        return acc;
      }, {});
      
      // Load all relations
      memoryGraph.relations.forEach(relation => {
        if (!knowledgeBase.relations[relation.from]) {
          knowledgeBase.relations[relation.from] = [];
        }
        knowledgeBase.relations[relation.from].push({
          to: relation.to,
          relationType: relation.relationType
        });
      });
      
      console.log('Full initialization - Complete knowledge graph loaded');
      break;
      
    default:
      console.log('Invalid initialization level');
      break;
  }
  
  return knowledgeBase;
}

/**
 * Parse initialization command to determine level and project
 * @param {String} command - Initialization command
 * @returns {Object} Initialization parameters
 */
function parseInitCommand(command) {
  const lowerCommand = command.toLowerCase();
  
  // Simple initialization commands
  if (['echo @ init', 'echo init', 'echo initiation', 'echo startup', '@echo startup'].includes(lowerCommand)) {
    return { level: INITIALIZATION_LEVELS.LIGHT };
  }
  
  // Light initialization
  if (lowerCommand.includes('core identity')) {
    return { level: INITIALIZATION_LEVELS.LIGHT };
  }
  
  // Full initialization
  if (lowerCommand.includes('full knowledge')) {
    return { level: INITIALIZATION_LEVELS.FULL };
  }
  
  // Repository initialization
  if (lowerCommand.includes('repository access')) {
    return { level: INITIALIZATION_LEVELS.REPOSITORY };
  }
  
  // Project initialization
  const projectMatch = lowerCommand.match(/initialize for (.+)/i);
  if (projectMatch && projectMatch[1]) {
    return { 
      level: INITIALIZATION_LEVELS.PROJECT,
      projectName: projectMatch[1].trim()
    };
  }
  
  // Default to light initialization
  return { level: INITIALIZATION_LEVELS.LIGHT };
}

// Export functions for use in other modules
module.exports = {
  loadMemoryGraph,
  initializeEcho,
  parseInitCommand,
  INITIALIZATION_LEVELS
};
