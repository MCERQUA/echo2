import time
from chat_monitor import ChatSessionMonitor

class ResponseController:
    def __init__(self):
        self.monitor = ChatSessionMonitor()
        self.last_response_time = None
    
    def prepare_response(self, user_input: str) -> float:
        """
        Call this before generating a response.
        Returns the recommended wait time.
        """
        current_time = time.time()
        
        # If this isn't our first response, enforce minimum gap
        if self.last_response_time:
            time_since_last = current_time - self.last_response_time
            if time_since_last < 2.5:  # Minimum 2.5s between responses
                return 2.5 - time_since_last
        
        return 0
    
    def record_response(self, user_input: str, assistant_response: str):
        """
        Record an interaction and enforce waiting if needed.
        Returns: True if successful, False if rate limited
        """
        # Get recommended wait time
        wait_time = self.monitor.record_interaction(user_input, assistant_response)
        
        # Update last response time
        self.last_response_time = time.time()
        
        if wait_time > 0:
            print(f"\nRate limit warning: Waiting {wait_time:.1f} seconds...")
            time.sleep(wait_time)
        
        return True

# Create global instance
controller = ResponseController()