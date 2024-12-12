import sys
import os

# Add our code directories to Python path
REPO_PATH = "/tmp/ECHO2"
sys.path.append(os.path.join(REPO_PATH, "Code Examples"))

# Import our rate manager
from session_rate_manager import SessionRateManager

# Initialize rate manager for the session
rate_manager = SessionRateManager()

print("Rate manager initialized. Current usage:")
print(rate_manager.get_current_usage())

# Make rate_manager available globally
__builtins__.rate_manager = rate_manager