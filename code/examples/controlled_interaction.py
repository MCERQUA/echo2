"""
Controlled interaction example with rate limiting
"""

import time
from session_controller import SessionController

def controlled_sequence():
    controller = SessionController()
    
    # Take screenshot
    controller.wait_if_needed()
    print("Taking screenshot...")
    # computer(action="screenshot")
    
    # Wait appropriate time
    controller.wait_if_needed()
    print("Moving mouse...")
    # computer(action="mouse_move", coordinate=[100, 100])
    
    # Log actions
    controller.log_action("interaction", "screenshot and mouse move")
    
if __name__ == "__main__":
    controlled_sequence()