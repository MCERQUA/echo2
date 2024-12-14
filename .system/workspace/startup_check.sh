#!/bin/bash

echo "=== ECHO2 Workspace Initialization ==="
echo "Starting workspace check at $(date)"

# Function to check for updates
check_updates() {
    echo "Checking for repository updates..."
    git fetch origin
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse @{u})

    if [ $LOCAL != $REMOTE ]; then
        echo "Updates detected, pulling changes..."
        git pull origin main
        return 0
    else
        echo "Repository is up to date."
        return 1
    fi
}

# Initialize/update workspace manifest
echo "Running workspace manifest check..."
python3 .system/workspace_control/workspace_manifest.py

# Check for Echo1's messages
if [ -f "letter-to-echo2.md" ]; then
    echo "Message from Echo1 detected!"
    echo "Content of message:"
    echo "==================="
    cat letter-to-echo2.md
    echo "==================="
fi

# Check change log for external modifications
if [ -f ".system/workspace_control/changes.log" ]; then
    RECENT_CHANGES=$(tail -n 50 .system/workspace_control/changes.log)
    if [ ! -z "$RECENT_CHANGES" ]; then
        echo "Recent changes detected in workspace:"
        echo "$RECENT_CHANGES"
    fi
fi

echo "Workspace initialization complete at $(date)"
