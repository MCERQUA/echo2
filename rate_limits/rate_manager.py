import json
import time
from datetime import datetime, timezone
import os
from typing import Dict, Any, Optional

class RateManager:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.config = self._load_config()
        self.current_usage = self._load_current_usage()
        self.last_update = datetime.now(timezone.utc)
        
    def _load_config(self) -> Dict[str, Any]:
        """Load rate limit configuration"""
        config_path = os.path.join(self.repo_path, 'config', 'rate_limits.json')
        with open(config_path, 'r') as f:
            return json.load(f)
            
    def _load_current_usage(self) -> Dict[str, Any]:
        """Load current usage data"""
        usage_path = os.path.join(self.repo_path, 'rate_limits', 'current_usage.json')
        with open(usage_path, 'r') as f:
            return json.load(f)
            
    def _save_current_usage(self):
        """Save current usage data"""
        usage_path = os.path.join(self.repo_path, 'rate_limits', 'current_usage.json')
        with open(usage_path, 'w') as f:
            json.dump(self.current_usage, f, indent=4)
            
    def _reset_minute_counters(self):
        """Reset per-minute counters"""
        self.current_usage["current_minute"] = {
            "start_time": datetime.now(timezone.utc).isoformat(),
            "requests": 0,
            "input_tokens": 0,
            "output_tokens": 0
        }
        
    def can_make_request(self, input_tokens: int, expected_output_tokens: int) -> bool:
        """Check if a request can be made within current limits"""
        current_time = datetime.now(timezone.utc)
        current_minute_start = datetime.fromisoformat(self.current_usage["current_minute"]["start_time"])
        
        # Reset if we're in a new minute
        if (current_time - current_minute_start).total_seconds() >= 60:
            self._reset_minute_counters()
            
        # Check against limits
        future_requests = self.current_usage["current_minute"]["requests"] + 1
        future_input = self.current_usage["current_minute"]["input_tokens"] + input_tokens
        future_output = self.current_usage["current_minute"]["output_tokens"] + expected_output_tokens
        
        return (
            future_requests <= self.config["limits"]["requests_per_minute"] and
            future_input <= self.config["limits"]["input_tokens_per_minute"] and
            future_output <= self.config["limits"]["output_tokens_per_minute"]
        )
        
    def wait_if_needed(self, input_tokens: int, expected_output_tokens: int):
        """Wait until a request can be made"""
        while not self.can_make_request(input_tokens, expected_output_tokens):
            time.sleep(self.config["optimization"]["min_pause_seconds"])
            
    def record_usage(self, input_tokens: int, output_tokens: int):
        """Record token usage for a request"""
        self.current_usage["current_minute"]["requests"] += 1
        self.current_usage["current_minute"]["input_tokens"] += input_tokens
        self.current_usage["current_minute"]["output_tokens"] += output_tokens
        
        self.current_usage["session_stats"]["total_requests"] += 1
        self.current_usage["session_stats"]["total_input_tokens"] += input_tokens
        self.current_usage["session_stats"]["total_output_tokens"] += output_tokens
        
        self._save_current_usage()
        
    def get_usage_stats(self) -> Dict[str, Any]:
        """Get current usage statistics"""
        return {
            "current_minute": self.current_usage["current_minute"],
            "session_stats": self.current_usage["session_stats"]
        }

# Example usage:
if __name__ == "__main__":
    manager = RateManager("/tmp/ECHO2")
    
    # Example request
    input_tokens = 100
    expected_output = 50
    
    manager.wait_if_needed(input_tokens, expected_output)
    # Make request here
    manager.record_usage(input_tokens, expected_output)
    
    print(json.dumps(manager.get_usage_stats(), indent=2))