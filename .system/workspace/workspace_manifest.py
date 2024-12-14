#!/usr/bin/env python3
"""
ECHO2 Workspace Management System
Maintains a manifest of all files, tracks changes, and alerts to external modifications
"""

import os
import json
import hashlib
import datetime
from typing import Dict, List, Set

class WorkspaceManager:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.manifest_file = os.path.join(repo_path, '.system/workspace_control/manifest.json')
        self.change_log_file = os.path.join(repo_path, '.system/workspace_control/changes.log')
        self.ignore_patterns = {'.git', '__pycache__', '.system/workspace_control/manifest.json'}
        
    def calculate_file_hash(self, filepath: str) -> str:
        """Calculate SHA-256 hash of file contents"""
        with open(filepath, 'rb') as f:
            return hashlib.sha256(f.read()).hexdigest()
            
    def generate_manifest(self) -> Dict:
        """Generate manifest of all files and their hashes"""
        manifest = {
            'last_update': datetime.datetime.now().isoformat(),
            'files': {},
            'directories': set()
        }
        
        for root, dirs, files in os.walk(self.repo_path):
            # Skip ignored directories
            dirs[:] = [d for d in dirs if not any(p in os.path.join(root, d) for p in self.ignore_patterns)]
            
            relroot = os.path.relpath(root, self.repo_path)
            if relroot != '.':
                manifest['directories'].add(relroot)
            
            for file in files:
                filepath = os.path.join(root, file)
                if any(p in filepath for p in self.ignore_patterns):
                    continue
                    
                relpath = os.path.relpath(filepath, self.repo_path)
                try:
                    manifest['files'][relpath] = {
                        'hash': self.calculate_file_hash(filepath),
                        'last_modified': os.path.getmtime(filepath),
                        'size': os.path.getsize(filepath)
                    }
                except (IOError, OSError) as e:
                    print(f"Error processing {filepath}: {e}")
                    
        manifest['directories'] = list(manifest['directories'])  # Convert set to list for JSON serialization
        return manifest
        
    def save_manifest(self, manifest: Dict):
        """Save manifest to file"""
        os.makedirs(os.path.dirname(self.manifest_file), exist_ok=True)
        with open(self.manifest_file, 'w') as f:
            json.dump(manifest, f, indent=2)
            
    def load_manifest(self) -> Dict:
        """Load existing manifest"""
        try:
            with open(self.manifest_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return None
            
    def check_for_changes(self) -> Dict:
        """Compare current state with manifest and identify changes"""
        old_manifest = self.load_manifest()
        new_manifest = self.generate_manifest()
        
        if not old_manifest:
            return {'new_files': list(new_manifest['files'].keys()), 'modified': [], 'deleted': []}
            
        changes = {
            'new_files': [],
            'modified': [],
            'deleted': []
        }
        
        # Check for new and modified files
        for filepath, info in new_manifest['files'].items():
            if filepath not in old_manifest['files']:
                changes['new_files'].append(filepath)
            elif info['hash'] != old_manifest['files'][filepath]['hash']:
                changes['modified'].append(filepath)
                
        # Check for deleted files
        for filepath in old_manifest['files']:
            if filepath not in new_manifest['files']:
                changes['deleted'].append(filepath)
                
        return changes
        
    def log_changes(self, changes: Dict):
        """Log detected changes"""
        if any(changes.values()):
            timestamp = datetime.datetime.now().isoformat()
            log_entry = f"\n=== Changes detected at {timestamp} ===\n"
            
            if changes['new_files']:
                log_entry += "\nNew files:\n" + "\n".join(f"+ {f}" for f in changes['new_files'])
            if changes['modified']:
                log_entry += "\nModified files:\n" + "\n".join(f"M {f}" for f in changes['modified'])
            if changes['deleted']:
                log_entry += "\nDeleted files:\n" + "\n".join(f"- {f}" for f in changes['deleted'])
                
            with open(self.change_log_file, 'a') as f:
                f.write(log_entry + "\n")
                
    def update_workspace(self):
        """Update workspace manifest and log changes"""
        changes = self.check_for_changes()
        self.log_changes(changes)
        self.save_manifest(self.generate_manifest())
        return changes

if __name__ == "__main__":
    manager = WorkspaceManager("/tmp/ECHO2")
    changes = manager.update_workspace()
    if any(changes.values()):
        print("\nChanges detected:")
        if changes['new_files']:
            print("\nNew files:")
            for f in changes['new_files']:
                print(f"+ {f}")
        if changes['modified']:
            print("\nModified files:")
            for f in changes['modified']:
                print(f"M {f}")
        if changes['deleted']:
            print("\nDeleted files:")
            for f in changes['deleted']:
                print(f"- {f}")
    else:
        print("\nNo changes detected in workspace.")
