import unittest
import time
from echo_operations import EchoOperations

class TestEchoOperations(unittest.TestCase):
    def setUp(self):
        self.echo_ops = EchoOperations()

    def test_basic_operation(self):
        """Test a basic operation execution"""
        def sample_operation():
            return "success"

        result = self.echo_ops.execute_operation(
            "Test Operation",
            input_tokens=100,
            output_tokens=50,
            operation_func=sample_operation
        )
        self.assertEqual(result, "success")

    def test_rate_limiting(self):
        """Test rate limiting functionality"""
        def quick_operation():
            return "done"

        start_time = time.time()
        # Execute multiple operations quickly
        for i in range(3):
            self.echo_ops.execute_operation(
                f"Quick Operation {i}",
                input_tokens=100,
                output_tokens=50,
                operation_func=quick_operation
            )
        duration = time.time() - start_time
        
        # Should have some delay due to rate limiting
        self.assertGreater(duration, 2.0)  # At least 2 seconds due to rate limiting

    def test_usage_reporting(self):
        """Test usage reporting functionality"""
        def sample_operation():
            return "done"

        # Execute some operations
        for i in range(2):
            self.echo_ops.execute_operation(
                f"Report Test Operation {i}",
                input_tokens=100,
                output_tokens=50,
                operation_func=sample_operation
            )

        # Get usage report
        report = self.echo_ops.get_usage_report()
        
        # Verify report structure
        self.assertIn('current_usage_percentages', report)
        self.assertIn('cumulative_stats', report)
        self.assertIn('current_time', report)
        
        # Verify stats
        stats = report['cumulative_stats']
        self.assertEqual(stats['requests'], 2)
        self.assertEqual(stats['input_tokens'], 200)
        self.assertEqual(stats['output_tokens'], 100)

    def test_batch_operations(self):
        """Test batch operations functionality"""
        def batch_op(x):
            return f"Result {x}"

        operations = [
            {
                'name': f"Batch Op {i}",
                'input_tokens': 100,
                'output_tokens': 50,
                'function': batch_op,
                'args': (i,)
            }
            for i in range(3)
        ]

        results = self.echo_ops.safe_execute_batch(operations)
        self.assertEqual(len(results), 3)
        self.assertEqual(results, ['Result 0', 'Result 1', 'Result 2'])

if __name__ == '__main__':
    unittest.main()