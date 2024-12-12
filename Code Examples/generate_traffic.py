from echo_operations import EchoOperations
import time

def simulate_traffic():
    echo_ops = EchoOperations()
    
    print("Generating test traffic...")
    
    # Simulate different types of operations
    for i in range(10):
        # Simulate a request with varying token counts
        echo_ops.execute_operation(
            operation_name=f"Test Operation {i}",
            input_tokens=1000 * (i + 1),  # Increasing input tokens
            output_tokens=500 * (i + 1),   # Increasing output tokens
            operation_func=lambda: time.sleep(0.5)  # Simulate work
        )
        
        print(f"Operation {i} completed")
        time.sleep(1)  # Space out operations

if __name__ == "__main__":
    simulate_traffic()