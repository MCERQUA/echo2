import time
from datetime import datetime, timedelta
from collections import deque
from typing import Dict, Deque, Tuple

class RateLimiter:
    """
    Rate limiter implementation for ECHO2 system.
    Handles request, input token, and output token limits.
    """
    def __init__(self):
        # Initialize windows for each limit type
        self.request_window: Deque[float] = deque()  # Tracks request timestamps
        self.input_tokens: Deque[Tuple[float, int]] = deque()  # Tracks input token usage
        self.output_tokens: Deque[Tuple[float, int]] = deque()  # Tracks output token usage
        
        # Configure limits with safety margins (50% of actual limits)
        self.REQUESTS_PER_MINUTE = 25  # 50% of max
        self.INPUT_TOKENS_PER_MINUTE = 20000  # 50% of max
        self.OUTPUT_TOKENS_PER_MINUTE = 4000  # 50% of max
        
        # Add cooling period after hitting limits
        self.COOLING_PERIOD = 70  # seconds, slightly more than 1 minute
        self.last_limit_hit = 0  # timestamp of last limit hit
        
        # Minimum delays (in seconds)
        self.MIN_REQUEST_DELAY = 2.5  # More conservative delay between requests
        self.WINDOW_SIZE = 60  # 1 minute window

    def _clean_window(self, window: Deque, current_time: float) -> None:
        """Remove entries older than the window size."""
        while window and current_time - window[0] > self.WINDOW_SIZE:
            window.popleft()

    def _clean_token_window(self, window: Deque[Tuple[float, int]], current_time: float) -> int:
        """Clean token window and return current total."""
        total = 0
        while window and current_time - window[0][0] > self.WINDOW_SIZE:
            window.popleft()
        return sum(tokens for _, tokens in window)

    def check_limits(self, input_tokens: int = 0, output_tokens: int = 0) -> Dict[str, float]:
        """
        Check all rate limits and return required delay times.
        Returns dict with keys: 'request_delay', 'input_delay', 'output_delay'
        """
        current_time = time.time()
        delays = {'request_delay': 0.0, 'input_delay': 0.0, 'output_delay': 0.0}

        # Check request rate
        self._clean_window(self.request_window, current_time)
        if len(self.request_window) >= self.REQUESTS_PER_MINUTE:
            delays['request_delay'] = max(
                self.WINDOW_SIZE - (current_time - self.request_window[0]),
                self.MIN_REQUEST_DELAY
            )
        else:
            # Always enforce minimum delay between requests
            if self.request_window:
                last_request_time = self.request_window[-1]
                time_since_last = current_time - last_request_time
                if time_since_last < self.MIN_REQUEST_DELAY:
                    delays['request_delay'] = self.MIN_REQUEST_DELAY - time_since_last

        # Check input tokens
        current_input = self._clean_token_window(self.input_tokens, current_time)
        if current_input + input_tokens > self.INPUT_TOKENS_PER_MINUTE:
            delays['input_delay'] = self.WINDOW_SIZE - (current_time - self.input_tokens[0][0])

        # Check output tokens
        current_output = self._clean_token_window(self.output_tokens, current_time)
        if current_output + output_tokens > self.OUTPUT_TOKENS_PER_MINUTE:
            delays['output_delay'] = self.WINDOW_SIZE - (current_time - self.output_tokens[0][0])

        return delays

    def record_operation(self, input_tokens: int = 0, output_tokens: int = 0) -> None:
        """Record an operation's resource usage."""
        current_time = time.time()
        
        # Record request
        self.request_window.append(current_time)
        
        # Record tokens if any
        if input_tokens > 0:
            self.input_tokens.append((current_time, input_tokens))
        if output_tokens > 0:
            self.output_tokens.append((current_time, output_tokens))

    def get_current_usage(self) -> Dict[str, float]:
        """Get current usage percentages."""
        current_time = time.time()
        
        # Clean windows first
        self._clean_window(self.request_window, current_time)
        current_input = self._clean_token_window(self.input_tokens, current_time)
        current_output = self._clean_token_window(self.output_tokens, current_time)
        
        return {
            'requests_usage': len(self.request_window) / self.REQUESTS_PER_MINUTE * 100,
            'input_tokens_usage': current_input / self.INPUT_TOKENS_PER_MINUTE * 100,
            'output_tokens_usage': current_output / self.OUTPUT_TOKENS_PER_MINUTE * 100
        }

# Usage example
def main():
    limiter = RateLimiter()
    
    # Simulate some operations
    for i in range(5):
        delays = limiter.check_limits(input_tokens=1000, output_tokens=200)
        
        # Apply the maximum delay needed
        max_delay = max(delays.values())
        if max_delay > 0:
            print(f"Waiting {max_delay:.2f} seconds...")
            time.sleep(max_delay)
            
        # Record the operation
        limiter.record_operation(input_tokens=1000, output_tokens=200)
        
        # Get current usage
        usage = limiter.get_current_usage()
        print(f"Current usage percentages: {usage}")

if __name__ == "__main__":
    main()