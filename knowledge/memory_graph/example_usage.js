/**
 * Echo Memory Graph - Example Usage
 * 
 * This script demonstrates how to use the memory graph system
 * for different initialization types and common operations.
 */

// Import the memory graph loader
const { 
  initializeEcho, 
  parseInitCommand, 
  INITIALIZATION_LEVELS 
} = require('./load_memory_graph');

/**
 * Demonstrate different initialization methods
 */
async function demonstrateInitialization() {
  console.log('===== INITIALIZATION EXAMPLES =====');
  
  // Light initialization (core identity only)
  const lightInit = await initializeEcho(INITIALIZATION_LEVELS.LIGHT);
  console.log(`Light initialization loaded ${Object.keys(lightInit.core).length} core entities`);
  
  // Project initialization
  const projectInit = await initializeEcho(INITIALIZATION_LEVELS.PROJECT, 'AI Phone System');
  console.log(`Project initialization loaded ${Object.keys(projectInit.core).length} core entities and ${Object.keys(projectInit.projects).length} project`);
  
  // Repository initialization
  const repoInit = await initializeEcho(INITIALIZATION_LEVELS.REPOSITORY);
  console.log(`Repository initialization loaded GitHub integration capabilities`);
  
  // Full initialization
  const fullInit = await initializeEcho(INITIALIZATION_LEVELS.FULL);
  console.log(`Full initialization loaded ${Object.keys(fullInit.core).length} core entities, ${Object.keys(fullInit.projects).length} projects, and ${Object.keys(fullInit.technology || {}).length} technology entities`);
  
  // Parsing initialization commands
  console.log('\n===== PARSING INITIALIZATION COMMANDS =====');
  
  const commands = [
    'echo init',
    'Echo, access core identity',
    'Echo, initialize for AI Phone System',
    'Echo, full knowledge access',
    'Echo, initialize with repository access'
  ];
  
  commands.forEach(command => {
    const result = parseInitCommand(command);
    console.log(`Command: "${command}" => Level: ${result.level}${result.projectName ? ', Project: ' + result.projectName : ''}`);
  });
  
  return fullInit; // Return full initialization for further examples
}

/**
 * Demonstrate entity and relation operations
 */
function demonstrateEntityOperations(knowledgeBase) {
  console.log('\n===== ENTITY AND RELATION OPERATIONS =====');
  
  // Get an entity by name
  function getEntity(name) {
    // Search in all entity collections
    return knowledgeBase.core[name] || 
           knowledgeBase.projects[name] || 
           knowledgeBase.technology?.[name] ||
           knowledgeBase.clients?.[name];
  }
  
  // Get all relations for an entity
  function getRelations(entityName) {
    return knowledgeBase.relations[entityName] || [];
  }
  
  // Get related entities of a specific type
  function getRelatedEntities(entityName, relationType) {
    const relations = getRelations(entityName);
    return relations
      .filter(relation => relation.relationType === relationType)
      .map(relation => ({
        name: relation.to,
        entity: getEntity(relation.to)
      }))
      .filter(item => item.entity); // Only include entities that exist
  }
  
  // Demonstrate retrieving entities
  const echoIdentity = getEntity('Echo_Core_Identity');
  if (echoIdentity) {
    console.log('Echo Core Identity:');
    console.log(`- Type: ${echoIdentity.entityType}`);
    console.log(`- Observations: ${echoIdentity.observations.length}`);
    console.log(`- Sample observation: "${echoIdentity.observations[0]}"`);
  }
  
  // Demonstrate retrieving relations
  const echoSystemsRelations = getRelations('Echo_Systems_Business');
  if (echoSystemsRelations) {
    console.log('\nEcho Systems Business Relations:');
    console.log(`- Total relations: ${echoSystemsRelations.length}`);
    
    // Group by relation type
    const relationsByType = {};
    echoSystemsRelations.forEach(relation => {
      if (!relationsByType[relation.relationType]) {
        relationsByType[relation.relationType] = [];
      }
      relationsByType[relation.relationType].push(relation.to);
    });
    
    // Display grouped relations
    Object.entries(relationsByType).forEach(([type, entities]) => {
      console.log(`- ${type}: ${entities.join(', ')}`);
    });
  }
  
  // Demonstrate filtering by relation type
  const managedProjects = getRelatedEntities('Echo_Systems_Business', 'manages');
  if (managedProjects.length > 0) {
    console.log('\nProjects managed by Echo Systems:');
    managedProjects.forEach(project => {
      console.log(`- ${project.name}`);
    });
  }
}

/**
 * Demonstrate knowledge tier management
 */
function demonstrateTierManagement(knowledgeBase) {
  console.log('\n===== KNOWLEDGE TIER MANAGEMENT =====');
  
  // Get tier information from core entities
  const tierSystem = knowledgeBase.core['Echo_Knowledge_Tiers'];
  
  if (tierSystem) {
    console.log('Knowledge Tier System:');
    tierSystem.observations.forEach(observation => {
      console.log(`- ${observation}`);
    });
  }
  
  // Simple function to identify entity tier by name and type
  function identifyTier(entityName) {
    const entity = knowledgeBase.core[entityName] || 
                   knowledgeBase.projects[entityName] || 
                   knowledgeBase.technology?.[entityName] ||
                   knowledgeBase.clients?.[entityName];
    
    if (!entity) return 'Unknown';
    
    // Identify tier based on entity type and name
    if (entityName.includes('Core_Identity') || entity.entityType === 'System') {
      return 'Tier 1 (Core Identity)';
    } else if (entity.entityType === 'Project' || entity.entityType === 'Client') {
      return 'Tier 2 (Active Projects)';
    } else if (entity.entityType === 'Technology' || entity.entityType === 'Integration') {
      return 'Tier 3 (Reference Knowledge)';
    } else {
      return 'Tier 4 (Archive)';
    }
  }
  
  // Example entities to identify tiers
  const entitiesToCheck = [
    'Echo_Core_Identity',
    'AI_Phone_System',
    'Model_Context_Protocol',
    'Josh_Client'
  ];
  
  console.log('\nEntity Tier Classification:');
  entitiesToCheck.forEach(entityName => {
    console.log(`- ${entityName}: ${identifyTier(entityName)}`);
  });
}

/**
 * Demonstrate adding and updating the memory graph
 * (Simulated - not actually modifying the file)
 */
function demonstrateUpdates() {
  console.log('\n===== MEMORY GRAPH UPDATES (SIMULATED) =====');
  
  // Simulate adding a new entity
  const newEntity = {
    name: 'New_Project',
    entityType: 'Project',
    observations: [
      'Example project for demonstration',
      'Created on March 9, 2025',
      'Priority level: Medium',
      'Status: Planning'
    ]
  };
  
  console.log('Adding new entity:');
  console.log(newEntity);
  
  // Simulate adding a new relation
  const newRelation = {
    from: 'Echo_Systems_Business',
    to: 'New_Project',
    relationType: 'manages'
  };
  
  console.log('\nAdding new relation:');
  console.log(newRelation);
  
  // Simulate updating an existing entity
  const updatedObservation = 'Updated on March 9, 2025 with new information';
  
  console.log('\nUpdating existing entity:');
  console.log(`Adding observation: "${updatedObservation}"`);
  
  console.log('\nIn a real implementation, these changes would be persisted to the JSON file.');
}

/**
 * Run all demonstrations
 */
async function runDemonstrations() {
  try {
    const knowledgeBase = await demonstrateInitialization();
    demonstrateEntityOperations(knowledgeBase);
    demonstrateTierManagement(knowledgeBase);
    demonstrateUpdates();
    
    console.log('\n===== DEMONSTRATION COMPLETE =====');
    console.log('The memory graph system provides a structured approach to maintaining Echo\'s knowledge across sessions.');
  } catch (error) {
    console.error('Error during demonstration:', error);
  }
}

// Run the demonstrations
runDemonstrations();
