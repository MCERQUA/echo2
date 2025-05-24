#!/usr/bin/env python3
"""
ECHO2 Unified Startup System
Integrates all startup components into a single, coherent system
"""

import os
import sys
import json
import time
import datetime
import subprocess
from typing import Dict, Optional

class Echo2StartupManager:
    def __init__(self, repo_path: str = "/tmp/ECHO2"):
        self.repo_path = repo_path
        self.config_path = os.path.join(repo_path, ".system/config")
        self.workspace_control_path = os.path.join(repo_path, ".system/workspace_control")
        self.session_start_time = datetime.datetime.now()
        
    def setup_ssh(self) -> bool:
        """Setup SSH authentication"""
        try:
            # These commands are from ECHO_STARTUP_SEQUENCE.md
            commands = [
                "mkdir -p ~/.ssh && chmod 700 ~/.ssh",
                "eval \"$(ssh-agent -s)\"",
                "ssh-add -t 43200 ~/.ssh/github_ed25519",
                "ssh-keyscan github.com >> ~/.ssh/known_hosts"
            ]
            
            for cmd in commands:
                subprocess.run(cmd, shell=True, check=True)
            return True
        except subprocess.CalledProcessError as e:
            print(f"SSH setup failed: {e}")
            return False

    def setup_git(self) -> bool:
        """Configure Git settings"""
        try:
            commands = [
                "git config --global user.name \"Echo 2\"",
                "git config --global user.email \"computeruse@dceec227115b\""
            ]
            
            for cmd in commands:
                subprocess.run(cmd, shell=True, check=True)
            return True
        except subprocess.CalledProcessError as e:
            print(f"Git configuration failed: {e}")
            return False

    def setup_environment(self) -> bool:
        """Setup environment variables and workspace"""
        try:
            os.environ['DISPLAY'] = ':1'
            os.environ['WORKSPACE'] = self.repo_path
            return True
        except Exception as e:
            print(f"Environment setup failed: {e}")
            return False

    def verify_repository(self) -> bool:
        """Verify repository access and update success.txt"""
        try:
            os.chdir(self.repo_path)
            timestamp = datetime.datetime.now().isoformat()
            
            with open('success.txt', 'w') as f:
                f.write(f"Successfully connected on {timestamp}\n")
            
            subprocess.run(["git", "add", "success.txt"], check=True)
            subprocess.run(["git", "commit", "-m", f"Update success.txt: {timestamp}"], check=True)
            subprocess.run(["git", "push", "origin", "main"], check=True)
            return True
        except Exception as e:
            print(f"Repository verification failed: {e}")
            return False

    def check_workspace(self) -> Dict:
        """Run workspace management checks"""
        try:
            result = subprocess.run(
                [os.path.join(self.workspace_control_path, "startup_check.sh")],
                capture_output=True,
                text=True,
                check=True
            )
            print(result.stdout)
            return {"status": "success", "output": result.stdout}
        except subprocess.CalledProcessError as e:
            print(f"Workspace check failed: {e}")
            return {"status": "error", "output": str(e)}

    def initialize(self) -> bool:
        """Run complete initialization sequence"""
        steps = [
            ("SSH Setup", self.setup_ssh),
            ("Git Configuration", self.setup_git),
            ("Environment Setup", self.setup_environment),
            ("Repository Verification", self.verify_repository),
            ("Workspace Check", self.check_workspace)
        ]
        
        success = True
        results = []
        
        print("\n=== ECHO2 Startup Sequence ===")
        for step_name, step_func in steps:
            print(f"\nExecuting: {step_name}")
            try:
                result = step_func()
                status = "✓" if result else "✗"
                results.append({"step": step_name, "status": status})
                if not result:
                    success = False
            except Exception as e:
                print(f"Error in {step_name}: {e}")
                results.append({"step": step_name, "status": "✗"})
                success = False
                
        print("\n=== Startup Summary ===")
        for result in results:
            print(f"{result['status']} {result['step']}")
            
        return success

if __name__ == "__main__":
    manager = Echo2StartupManager()
    success = manager.initialize()
    sys.exit(0 if success else 1)