#!/usr/bin/env python3

import difflib
import json
import os
import re
from typing import Dict, List, Tuple, Any
from datetime import datetime

class VersionComparer:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.version_cache = {}
        self.capability_map = {}

    def parse_version(self, version_str: str) -> Tuple[int, ...]:
        """Convert version string to tuple for comparison."""
        return tuple(map(int, version_str.strip('v').split('.')))

    def extract_capabilities(self, content: str) -> List[str]:
        """Extract capabilities and features from document content."""
        capabilities = []
        # Look for capability indicators like:
        # - Bullet points with action verbs
        # - Function definitions
        # - Feature descriptions
        capability_patterns = [
            r'- \w+.*',  # Bullet points
            r'\*\* \w+.*',  # Bold items
            r'^\d+\. \w+.*',  # Numbered items
            r'function \w+',  # Function definitions
            r'capability: \w+'  # Explicit capability markers
        ]
        
        for pattern in capability_patterns:
            matches = re.finditer(pattern, content, re.MULTILINE)
            capabilities.extend(match.group(0) for match in matches)
        
        return capabilities

    def compare_versions(self, old_version: str, new_version: str) -> Dict[str, Any]:
        """Compare two versions of a document or system."""
        comparison_result = {
            'timestamp': datetime.now().isoformat(),
            'old_version': old_version,
            'new_version': new_version,
            'changes': {
                'added': [],
                'removed': [],
                'modified': []
            },
            'capabilities': {
                'maintained': [],
                'new': [],
                'removed': []
            }
        }

        # Compare capabilities between versions
        old_capabilities = self.capability_map.get(old_version, [])
        new_capabilities = self.capability_map.get(new_version, [])
        
        comparison_result['capabilities'].update({
            'maintained': list(set(old_capabilities) & set(new_capabilities)),
            'new': list(set(new_capabilities) - set(old_capabilities)),
            'removed': list(set(old_capabilities) - set(new_capabilities))
        })

        return comparison_result

    def validate_version_sequence(self, versions: List[str]) -> Dict[str, Any]:
        """Validate that version sequence is complete without gaps."""
        sorted_versions = sorted(versions, key=self.parse_version)
        validation_result = {
            'complete': True,
            'gaps': [],
            'invalid_jumps': []
        }

        for i in range(len(sorted_versions) - 1):
            current = self.parse_version(sorted_versions[i])
            next_ver = self.parse_version(sorted_versions[i + 1])
            
            # Check for version gaps
            if next_ver[0] - current[0] > 1 or \
               (next_ver[0] == current[0] and next_ver[1] - current[1] > 1):
                validation_result['complete'] = False
                validation_result['gaps'].append(f"{sorted_versions[i]} -> {sorted_versions[i + 1]}")

        return validation_result

    def generate_compatibility_report(self) -> Dict[str, Any]:
        """Generate report on compatibility between versions."""
        return {
            'timestamp': datetime.now().isoformat(),
            'version_sequence': self.validate_version_sequence(list(self.version_cache.keys())),
            'capability_evolution': {
                version: self.capability_map.get(version, [])
                for version in self.version_cache.keys()
            }
        }

def main():
    repo_path = "/tmp/ECHO2"
    comparer = VersionComparer(repo_path)
    
    # Generate compatibility report
    report = comparer.generate_compatibility_report()
    
    # Save report
    report_path = os.path.join(repo_path, 'knowledge_base', 'version_compatibility_report.json')
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

if __name__ == "__main__":
    main()