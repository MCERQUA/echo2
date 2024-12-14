from echo_operations import EchoOperations
import time
import json

def simulate_api_call(text: str) -> str:
    """Simulate an API call with some processing."""
    time.sleep(0.5)  # Simulate network delay
    return f"Processed: {text}"

def main():
    # Initialize the operations handler
    echo_ops = EchoOperations()
    
    # Example 1: Single operation
    result = echo_ops.execute_operation(
        "Process Text",
        input_tokens=100,
        output_tokens=50,
        operation_func=simulate_api_call,
        args=("Hello, World!",)
    )
    print(f"Single operation result: {result}")

    # Example 2: Batch operations
    batch_operations = [
        {
            'name': f"Batch Operation {i}",
            'input_tokens': 100,
            'output_tokens': 50,
            'function': simulate_api_call,
            'args': (f"Batch text {i}",)
        }
        for i in range(3)
    ]
    
    results = echo_ops.safe_execute_batch(batch_operations)
    print("\nBatch operations results:", results)

    # Generate and display usage report
    report = echo_ops.get_usage_report()
    print("\nFinal Usage Report:")
    print(json.dumps(report, indent=2))

if __name__ == "__main__":
    main()