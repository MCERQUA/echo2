#!/usr/bin/env python3

import os
import json
import re
from typing import Dict, List, Set, Any
from datetime import datetime
import networkx as nx

class CrossReferenceManager:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.reference_graph = nx.DiGraph()
        self.document_index = {}
        self.concept_map = {}

    def index_documents(self) -> Dict[str, Any]:
        """Build index of all documents and their content."""
        for root, _, files in os.walk(self.repo_path):
            for file in files:
                if file.endswith(('.md', '.py', '.json', '.txt')):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, self.repo_path)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        self.document_index[rel_path] = {
                            'content': content,
                            'last_modified': os.path.getmtime(file_path),
                            'references': set(),
                            'referenced_by': set()
                        }

    def extract_references(self) -> None:
        """Extract references between documents."""
        # Patterns for different types of references
        reference_patterns = {
            'markdown_link': r'\[([^\]]+)\]\(([^)]+)\)',
            'import_statement': r'(?:import|from)\s+(\w+(?:\.\w+)*)',
            'file_reference': r'(?:file:|path:)\s*([\/\w\-\.]+)',
            'see_also': r'(?:see also|reference):\s*([\/\w\-\.]+)',
            'related_docs': r'related(?:\s+documents?)?:\s*([\/\w\-\.]+)'
        }

        for doc_path, doc_info in self.document_index.items():
            content = doc_info['content']
            
            for pattern_name, pattern in reference_patterns.items():
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    referenced_path = match.group(1)
                    if referenced_path in self.document_index:
                        self.reference_graph.add_edge(doc_path, referenced_path)
                        doc_info['references'].add(referenced_path)
                        self.document_index[referenced_path]['referenced_by'].add(doc_path)

    def build_concept_map(self) -> Dict[str, Set[str]]:
        """Build map of concepts and their occurrences across documents."""
        concept_patterns = [
            r'##\s*([\w\s]+)',  # Markdown headers
            r'class\s+(\w+)',   # Class definitions
            r'def\s+(\w+)',     # Function definitions
            r'\*\*(\w+)\*\*'    # Bold text in markdown
        ]

        for doc_path, doc_info in self.document_index.items():
            content = doc_info['content']
            
            for pattern in concept_patterns:
                matches = re.finditer(pattern, content)
                for match in matches:
                    concept = match.group(1).strip()
                    if concept not in self.concept_map:
                        self.concept_map[concept] = set()
                    self.concept_map[concept].add(doc_path)

    def find_missing_references(self) -> List[Dict[str, Any]]:
        """Find potentially missing references between related documents."""
        missing_refs = []
        
        # Use NetworkX to analyze the reference graph
        for concept, documents in self.concept_map.items():
            if len(documents) > 1:
                # Documents sharing concepts should probably reference each other
                for doc1 in documents:
                    for doc2 in documents:
                        if doc1 != doc2 and not self.reference_graph.has_edge(doc1, doc2):
                            missing_refs.append({
                                'concept': concept,
                                'from_doc': doc1,
                                'to_doc': doc2,
                                'type': 'shared_concept'
                            })

        return missing_refs

    def generate_reference_report(self) -> Dict[str, Any]:
        """Generate comprehensive report of cross-references."""
        return {
            'timestamp': datetime.now().isoformat(),
            'documents': {
                path: {
                    'references': list(info['references']),
                    'referenced_by': list(info['referenced_by']),
                    'last_modified': info['last_modified']
                }
                for path, info in self.document_index.items()
            },
            'concepts': {
                concept: list(documents)
                for concept, documents in self.concept_map.items()
            },
            'missing_references': self.find_missing_references(),
            'statistics': {
                'total_documents': len(self.document_index),
                'total_concepts': len(self.concept_map),
                'total_references': self.reference_graph.number_of_edges()
            }
        }

def main():
    repo_path = "/tmp/ECHO2"
    manager = CrossReferenceManager(repo_path)
    
    # Build document index
    manager.index_documents()
    
    # Extract references
    manager.extract_references()
    
    # Build concept map
    manager.build_concept_map()
    
    # Generate report
    report = manager.generate_reference_report()
    
    # Save report
    report_path = os.path.join(repo_path, 'knowledge_base', 'cross_reference_report.json')
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2)

if __name__ == "__main__":
    main()