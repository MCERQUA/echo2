"""
Rate Limit Controller for Echo 2
Manages request timing and token usage to prevent rate limit errors
"""

import time
from datetime import datetime
import json
from typing import Dict, List, Optional

class RateLimitController:
    def __init__(self):
        self.rpm_limit = 50  # Requests per minute
        self.itpm_limit = 40000  # Input tokens per minute
        self.otpm_limit = 8000  # Output tokens per minute
        
        self.request_timestamps: List[float] = []
        self.input_tokens: Dict[int, int] = {}  # minute -> token count
        self.output_tokens: Dict[int, int] = {}  # minute -> token count
        
        self.last_cleanup = time.time()

    def _cleanup_old_data(self):
        """Remove data older than 2 minutes"""
        current_time = time.time()
        if current_time - self.last_cleanup < 60:  # Only cleanup once per minute
            return
            
        current_minute = int(current_time / 60)
        self.request_timestamps = [ts for ts in self.request_timestamps 
                                 if current_time - ts <= 120]
        
        self.input_tokens = {k: v for k, v in self.input_tokens.items() 
                           if k >= current_minute - 2}
        self.output_tokens = {k: v for k, v in self.output_tokens.items() 
                            if k >= current_minute - 2}
        
        self.last_cleanup = current_time

    def can_make_request(self) -> bool:
        """Check if a new request can be made within rate limits"""
        self._cleanup_old_data()
        current_time = time.time()
        recent_requests = len([ts for ts in self.request_timestamps 
                             if current_time - ts <= 60])
        return recent_requests < self.rpm_limit

    def wait_if_needed(self):
        """Wait until a request can be made"""
        while not self.can_make_request():
            time.sleep(1)  # Wait 1 second before checking again
        self.request_timestamps.append(time.time())

    def record_tokens(self, input_tokens: int, output_tokens: int):
        """Record token usage for the current minute"""
        current_minute = int(time.time() / 60)
        
        self.input_tokens[current_minute] = self.input_tokens.get(current_minute, 0) + input_tokens
        self.output_tokens[current_minute] = self.output_tokens.get(current_minute, 0) + output_tokens

    def get_current_usage(self) -> Dict[str, float]:
        """Get current usage percentages"""
        current_minute = int(time.time() / 60)
        current_rpm = len([ts for ts in self.request_timestamps 
                         if time.time() - ts <= 60])
        current_itpm = self.input_tokens.get(current_minute, 0)
        current_otpm = self.output_tokens.get(current_minute, 0)
        
        return {
            "rpm_percentage": (current_rpm / self.rpm_limit) * 100,
            "itpm_percentage": (current_itpm / self.itpm_limit) * 100,
            "otpm_percentage": (current_otpm / self.otpm_limit) * 100
        }

    def save_state(self, filepath: str):
        """Save controller state to file"""
        state = {
            "request_timestamps": self.request_timestamps,
            "input_tokens": self.input_tokens,
            "output_tokens": self.output_tokens,
            "last_cleanup": self.last_cleanup
        }
        with open(filepath, 'w') as f:
            json.dump(state, f)

    @classmethod
    def load_state(cls, filepath: str) -> 'RateLimitController':
        """Load controller state from file"""
        controller = cls()
        try:
            with open(filepath, 'r') as f:
                state = json.load(f)
                controller.request_timestamps = state["request_timestamps"]
                controller.input_tokens = {int(k): v for k, v in state["input_tokens"].items()}
                controller.output_tokens = {int(k): v for k, v in state["output_tokens"].items()}
                controller.last_cleanup = state["last_cleanup"]
        except (FileNotFoundError, json.JSONDecodeError):
            pass  # Use default state if file doesn't exist or is invalid
        return controller

# Example usage:
if __name__ == "__main__":
    controller = RateLimitController()
    
    # Example request cycle
    controller.wait_if_needed()  # Wait if we're at rate limit
    # Make request here
    controller.record_tokens(input_tokens=100, output_tokens=50)
    
    # Check current usage
    usage = controller.get_current_usage()
    print(f"Current Usage:")
    print(f"Requests/min: {usage['rpm_percentage']:.1f}%")
    print(f"Input tokens/min: {usage['itpm_percentage']:.1f}%")
    print(f"Output tokens/min: {usage['otpm_percentage']:.1f}%")