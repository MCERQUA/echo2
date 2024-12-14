import logging
import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional
from rate_limiter import RateLimiter

class EchoOperations:
    """
    Main operations handler for ECHO2 system.
    Integrates rate limiting, logging, and usage reporting.
    """
    def __init__(self, log_dir: str = "/tmp/ECHO2/logs"):
        self.rate_limiter = RateLimiter()
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize logging
        self._setup_logging()
        
        # Initialize usage stats
        self.usage_stats = {
            'requests': 0,
            'input_tokens': 0,
            'output_tokens': 0,
            'delays': 0,
            'start_time': datetime.now().isoformat()
        }

    def _setup_logging(self):
        """Configure logging system."""
        log_file = self.log_dir / "echo_operations.log"
        
        # Configure file handler
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        file_formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(file_formatter)

        # Configure console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(logging.INFO)
        console_formatter = logging.Formatter(
            '%(levelname)s: %(message)s'
        )
        console_handler.setFormatter(console_formatter)

        # Setup logger
        self.logger = logging.getLogger('ECHO2')
        self.logger.setLevel(logging.INFO)
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)

    def execute_operation(self, 
                         operation_name: str,
                         input_tokens: int,
                         output_tokens: int,
                         operation_func: callable,
                         *args,
                         **kwargs) -> Any:
        """
        Execute an operation with rate limiting and logging.
        
        Args:
            operation_name: Name/description of the operation
            input_tokens: Expected input token count
            output_tokens: Expected output token count
            operation_func: Function to execute
            *args, **kwargs: Arguments for operation_func
        """
        self.logger.info(f"Starting operation: {operation_name}")
        
        # Check rate limits
        delays = self.rate_limiter.check_limits(input_tokens, output_tokens)
        max_delay = max(delays.values())
        
        if max_delay > 0:
            self.logger.info(f"Rate limit delay: {max_delay:.2f}s")
            self.usage_stats['delays'] += max_delay
            time.sleep(max_delay)

        try:
            # Execute operation
            start_time = time.time()
            result = operation_func(*args, **kwargs)
            duration = time.time() - start_time

            # Record operation
            self.rate_limiter.record_operation(input_tokens, output_tokens)
            self._update_usage_stats(input_tokens, output_tokens)

            # Log success
            self.logger.info(
                f"Operation completed: {operation_name} "
                f"(duration: {duration:.2f}s)"
            )
            
            return result

        except Exception as e:
            self.logger.error(
                f"Operation failed: {operation_name} - Error: {str(e)}"
            )
            raise

    def _update_usage_stats(self, input_tokens: int, output_tokens: int):
        """Update usage statistics."""
        self.usage_stats['requests'] += 1
        self.usage_stats['input_tokens'] += input_tokens
        self.usage_stats['output_tokens'] += output_tokens

    def get_usage_report(self) -> Dict[str, Any]:
        """Generate current usage report."""
        current_usage = self.rate_limiter.get_current_usage()
        
        report = {
            'current_usage_percentages': current_usage,
            'cumulative_stats': self.usage_stats,
            'current_time': datetime.now().isoformat(),
        }
        
        # Log and save report
        report_path = self.log_dir / f"usage_report_{int(time.time())}.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        self.logger.info(f"Usage report generated: {report_path}")
        return report

    def safe_execute_batch(self, operations: list) -> list:
        """
        Safely execute a batch of operations with rate limiting.
        
        Args:
            operations: List of dicts containing operation details:
                {
                    'name': str,
                    'input_tokens': int,
                    'output_tokens': int,
                    'function': callable,
                    'args': tuple,
                    'kwargs': dict
                }
        """
        results = []
        for op in operations:
            result = self.execute_operation(
                op['name'],
                op['input_tokens'],
                op['output_tokens'],
                op['function'],
                *op.get('args', ()),
                **op.get('kwargs', {})
            )
            results.append(result)
        return results

# Example usage
def example_operation():
    """Example operation for demonstration."""
    print("Executing example operation...")
    time.sleep(1)  # Simulate work
    return "Operation complete"

if __name__ == "__main__":
    # Initialize operations handler
    echo_ops = EchoOperations()
    
    # Execute some example operations
    for i in range(3):
        echo_ops.execute_operation(
            f"Example Operation {i}",
            input_tokens=1000,
            output_tokens=200,
            operation_func=example_operation
        )
    
    # Generate usage report
    report = echo_ops.get_usage_report()
    print("\nUsage Report:")
    print(json.dumps(report, indent=2))