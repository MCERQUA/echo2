#!/usr/bin/env python3

import os
import json
import yaml
import sys
from datetime import datetime
from typing import Dict, Any
from knowledge_integration import KnowledgeIntegrator
from version_comparison import VersionComparer
from cross_reference_manager import CrossReferenceManager

class KnowledgeSystemUpdater:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.integrator = KnowledgeIntegrator(repo_path)
        self.version_comparer = VersionComparer(repo_path)
        self.cross_reference_manager = CrossReferenceManager(repo_path)
        self.update_log = []

    def run_system_update(self) -> Dict[str, Any]:
        """Run complete system update and validation."""
        update_results = {
            'timestamp': datetime.now().isoformat(),
            'status': 'in_progress',
            'steps': []
        }

        try:
            # Step 1: Knowledge Integration
            self.update_log.append("Running knowledge integration...")
            knowledge_map = self.integrator.scan_knowledge_files()
            integration_report = self.integrator.generate_integration_report()
            update_results['steps'].append({
                'step': 'knowledge_integration',
                'status': 'complete',
                'files_processed': len(knowledge_map.get('files', []))
            })

            # Step 2: Version Comparison
            self.update_log.append("Comparing versions...")
            compatibility_report = self.version_comparer.generate_compatibility_report()
            update_results['steps'].append({
                'step': 'version_comparison',
                'status': 'complete',
                'version_count': len(compatibility_report.get('capability_evolution', {}))
            })

            # Step 3: Cross-Reference Update
            self.update_log.append("Updating cross-references...")
            self.cross_reference_manager.index_documents()
            self.cross_reference_manager.extract_references()
            self.cross_reference_manager.build_concept_map()
            reference_report = self.cross_reference_manager.generate_reference_report()
            update_results['steps'].append({
                'step': 'cross_reference_update',
                'status': 'complete',
                'references_found': reference_report['statistics']['total_references']
            })

            # Step 4: Generate System Update Report
            update_results['status'] = 'complete'
            update_results['summary'] = {
                'knowledge_files': len(knowledge_map.get('files', [])),
                'total_references': reference_report['statistics']['total_references'],
                'total_concepts': reference_report['statistics']['total_concepts']
            }

        except Exception as e:
            update_results['status'] = 'failed'
            update_results['error'] = str(e)
            self.update_log.append(f"Error during update: {str(e)}")

        return update_results

    def apply_updates(self) -> None:
        """Apply any necessary updates to the knowledge system."""
        # Create knowledge_base directory if it doesn't exist
        kb_dir = os.path.join(self.repo_path, 'knowledge_base')
        os.makedirs(kb_dir, exist_ok=True)

        # Save all reports
        reports = {
            'system_update': self.run_system_update(),
            'update_log': self.update_log
        }

        # Save reports to knowledge base
        for report_name, report_data in reports.items():
            report_path = os.path.join(kb_dir, f'{report_name}.json')
            with open(report_path, 'w', encoding='utf-8') as f:
                json.dump(report_data, f, indent=2)

    def update_session_knowledge(self) -> None:
        """Update session knowledge with latest system state."""
        session_info = {
            'timestamp': datetime.now().isoformat(),
            'system_state': {
                'knowledge_files': len(self.integrator.knowledge_map.get('files', [])),
                'cross_references': len(self.cross_reference_manager.reference_graph.edges()),
                'concepts': len(self.cross_reference_manager.concept_map)
            },
            'update_log': self.update_log
        }

        # Update current session knowledge
        self.integrator.update_session_knowledge(session_info)

def main():
    repo_path = "/tmp/ECHO2"
    updater = KnowledgeSystemUpdater(repo_path)
    
    print("Starting knowledge system update...")
    updater.apply_updates()
    updater.update_session_knowledge()
    print("Knowledge system update complete.")

if __name__ == "__main__":
    main()