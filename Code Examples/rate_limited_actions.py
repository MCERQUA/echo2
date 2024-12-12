import time

class ActionController:
    def __init__(self):
        # Rate limits
        self.requests_per_minute = 50
        self.min_pause = 1.2  # seconds between actions
        
        # State tracking
        self.last_action_time = time.time()
        self.actions_this_minute = 0
        self.minute_start_time = time.time()
    
    def wait_if_needed(self):
        """Implement rate limiting logic"""
        current_time = time.time()
        
        # Reset counter if we're in a new minute
        if current_time - self.minute_start_time >= 60:
            self.actions_this_minute = 0
            self.minute_start_time = current_time
        
        # Enforce minimum pause between actions
        time_since_last = current_time - self.last_action_time
        if time_since_last < self.min_pause:
            pause_time = self.min_pause - time_since_last
            time.sleep(pause_time)
        
        # Update state
        self.last_action_time = time.time()
        self.actions_this_minute += 1
        
        # If we're at the limit, wait for next minute
        if self.actions_this_minute >= self.requests_per_minute:
            wait_time = 60 - (time.time() - self.minute_start_time)
            if wait_time > 0:
                time.sleep(wait_time)
            self.actions_this_minute = 0
            self.minute_start_time = time.time()
    
    def perform_action(self, action_func, *args, **kwargs):
        """Perform an action with rate limiting"""
        self.wait_if_needed()
        return action_func(*args, **kwargs)