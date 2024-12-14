import time
from datetime import datetime

class SessionRateManager:
    def __init__(self):
        # Rate limits
        self.RPM_LIMIT = 50
        self.ITPM_LIMIT = 40000  # Input tokens per minute
        self.OTPM_LIMIT = 8000   # Output tokens per minute
        
        # Current minute tracking
        self.minute_start = datetime.now()
        self.requests_this_minute = 0
        self.input_tokens_this_minute = 0
        self.output_tokens_this_minute = 0
        
        # Minimum pause between requests
        self.MIN_PAUSE = 1.2  # seconds
        self.last_request_time = datetime.now()
    
    def _reset_if_new_minute(self):
        """Reset counters if we're in a new minute"""
        now = datetime.now()
        if (now - self.minute_start).total_seconds() >= 60:
            self.minute_start = now
            self.requests_this_minute = 0
            self.input_tokens_this_minute = 0
            self.output_tokens_this_minute = 0
    
    def can_make_request(self, input_tokens: int, expected_output: int) -> bool:
        """Check if we can make a request within our limits"""
        self._reset_if_new_minute()
        
        return (
            self.requests_this_minute < self.RPM_LIMIT and
            self.input_tokens_this_minute + input_tokens <= self.ITPM_LIMIT and
            self.output_tokens_this_minute + expected_output <= self.OTPM_LIMIT
        )
    
    def wait_if_needed(self, input_tokens: int, expected_output: int):
        """Wait until we can make a request"""
        # First, ensure minimum pause between requests
        time_since_last = (datetime.now() - self.last_request_time).total_seconds()
        if time_since_last < self.MIN_PAUSE:
            time.sleep(self.MIN_PAUSE - time_since_last)
        
        # Then wait if we're at rate limits
        while not self.can_make_request(input_tokens, expected_output):
            time.sleep(1)  # Wait 1 second and check again
            self._reset_if_new_minute()
    
    def record_request(self, input_tokens: int, output_tokens: int):
        """Record a completed request"""
        self._reset_if_new_minute()
        self.requests_this_minute += 1
        self.input_tokens_this_minute += input_tokens
        self.output_tokens_this_minute += output_tokens
        self.last_request_time = datetime.now()
    
    def get_current_usage(self):
        """Get current usage statistics"""
        self._reset_if_new_minute()
        return {
            "requests": f"{self.requests_this_minute}/{self.RPM_LIMIT}",
            "input_tokens": f"{self.input_tokens_this_minute}/{self.ITPM_LIMIT}",
            "output_tokens": f"{self.output_tokens_this_minute}/{self.OTPM_LIMIT}"
        }

# To use in your startup procedure:
# rate_manager = SessionRateManager()

# Before making a request:
# rate_manager.wait_if_needed(estimated_input_tokens, estimated_output_tokens)

# After request completes:
# rate_manager.record_request(actual_input_tokens, actual_output_tokens)