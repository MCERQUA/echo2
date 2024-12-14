from session_rate_manager import SessionRateManager
import time

def test_rate_manager():
    # Initialize the rate manager
    manager = SessionRateManager()
    
    print("Starting rate manager test...")
    
    # Test 1: Basic usage tracking
    print("\nTest 1: Basic usage tracking")
    print("Initial usage:", manager.get_current_usage())
    
    # Test 2: Make a series of requests
    print("\nTest 2: Making 5 requests in quick succession")
    for i in range(5):
        input_tokens = 1000  # Simulate a medium-sized request
        expected_output = 200
        
        start_time = time.time()
        manager.wait_if_needed(input_tokens, expected_output)
        wait_time = time.time() - start_time
        
        manager.record_request(input_tokens, expected_output)
        print(f"Request {i+1} completed (waited {wait_time:.2f}s)")
        print("Current usage:", manager.get_current_usage())
    
    # Test 3: Try to exceed rate limit
    print("\nTest 3: Testing rate limit prevention")
    large_input = 35000  # Almost all of our input token limit
    large_output = 7000  # Almost all of our output token limit
    
    start_time = time.time()
    manager.wait_if_needed(large_input, large_output)
    wait_time = time.time() - start_time
    
    manager.record_request(large_input, large_output)
    print(f"Large request completed (waited {wait_time:.2f}s)")
    print("Final usage:", manager.get_current_usage())

if __name__ == "__main__":
    test_rate_manager()