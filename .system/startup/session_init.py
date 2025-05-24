#!/usr/bin/env python3
"""
ECHO2 Session Initialization
Focuses on GitHub as the only persistent storage
"""

import os
import subprocess
import json
from datetime import datetime

class SessionInitializer:
    def __init__(self):
        self.repo_url = "git@github.com:MCERQUA/ECHO2.git"
        self.work_dir = "/tmp/ECHO2"
        self.messages_dir = ".system/communications/messages/new"
        
    def setup_ssh(self):
        """Setup SSH for GitHub access"""
        try:
            subprocess.run("eval $(ssh-agent) && ssh-add ~/.ssh/github_ed25519", shell=True, check=True)
            return True
        except subprocess.CalledProcessError:
            print("Failed to setup SSH")
            return False
            
    def clone_repository(self):
        """Clone the GitHub repository - our only persistent storage"""
        try:
            if os.path.exists(self.work_dir):
                print(f"Cleaning up existing directory: {self.work_dir}")
                subprocess.run(f"rm -rf {self.work_dir}", shell=True, check=True)
                
            print("Cloning repository from GitHub...")
            subprocess.run(f"git clone {self.repo_url} {self.work_dir}", shell=True, check=True)
            return True
        except subprocess.CalledProcessError as e:
            print(f"Failed to clone repository: {e}")
            return False
            
    def check_messages(self):
        """Check for new messages in GitHub repository"""
        messages_path = os.path.join(self.work_dir, self.messages_dir)
        if os.path.exists(messages_path):
            messages = os.listdir(messages_path)
            if messages:
                print("\nNew messages found:")
                for msg in messages:
                    print(f"- {msg}")
                return messages
        return []
        
    def record_session_start(self):
        """Record session start in GitHub"""
        try:
            timestamp = datetime.now().isoformat()
            success_file = os.path.join(self.work_dir, "success.txt")
            
            with open(success_file, 'w') as f:
                f.write(f"Session started at {timestamp}\n")
                
            os.chdir(self.work_dir)
            subprocess.run("git add success.txt", shell=True, check=True)
            subprocess.run(f'git commit -m "Session start: {timestamp}"', shell=True, check=True)
            subprocess.run("git push origin main", shell=True, check=True)
            return True
        except Exception as e:
            print(f"Failed to record session start: {e}")
            return False
            
    def initialize_session(self):
        """Complete session initialization sequence"""
        print("\n=== ECHO2 Session Initialization ===")
        print("Reminder: GitHub is our ONLY persistent storage!")
        
        steps = [
            ("SSH Setup", self.setup_ssh),
            ("Repository Clone", self.clone_repository),
            ("Message Check", self.check_messages),
            ("Session Recording", self.record_session_start)
        ]
        
        success = True
        for step_name, step_func in steps:
            print(f"\nExecuting: {step_name}")
            result = step_func()
            if result is False:  # Some functions return lists/dicts
                success = False
                print(f"Failed: {step_name}")
            else:
                print(f"Success: {step_name}")
                
        return success

if __name__ == "__main__":
    initializer = SessionInitializer()
    initializer.initialize_session()