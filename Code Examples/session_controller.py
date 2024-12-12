import time
import json
from datetime import datetime

class SessionController:
    def __init__(self):
        self.last_action_time = time.time()
        self.requests_this_minute = 0
        self.last_minute_reset = time.time()
        
        # Configure limits
        self.rpm_limit = 50  # requests per minute
        self.min_pause = 1.2  # seconds between actions (allows ~50 requests/minute)
        
    def wait_if_needed(self):
        """Ensure we don't exceed rate limits"""
        current_time = time.time()
        
        # Reset counter if we're in a new minute
        if current_time - self.last_minute_reset >= 60:
            self.requests_this_minute = 0
            self.last_minute_reset = current_time
        
        # Check if we need to wait
        if self.requests_this_minute >= self.rpm_limit:
            wait_time = 60 - (current_time - self.last_minute_reset)
            if wait_time > 0:
                time.sleep(wait_time)
            self.requests_this_minute = 0
            self.last_minute_reset = time.time()
        
        # Ensure minimum pause between actions
        time_since_last = current_time - self.last_action_time
        if time_since_last < self.min_pause:
            time.sleep(self.min_pause - time_since_last)
        
        self.last_action_time = time.time()
        self.requests_this_minute += 1
        
    def log_action(self, action_type: str, details: str = ""):
        """Log actions for monitoring"""
        timestamp = datetime.now().isoformat()
        log_entry = {
            "timestamp": timestamp,
            "action_type": action_type,
            "details": details,
            "requests_this_minute": self.requests_this_minute
        }
        
        with open("/tmp/ECHO2/session_log.json", "a") as f:
            f.write(json.dumps(log_entry) + "\n")

# Example usage:
# controller = SessionController()
# controller.wait_if_needed()  # Call before any action
# controller.log_action("computer_function", "screenshot")