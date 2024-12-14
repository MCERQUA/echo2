# ECHO2 Operations Integration Guide

## Overview
This guide explains how to integrate rate limiting, logging, and usage reporting into ECHO2 operations.

## Components

### 1. Rate Limiting Integration
The system automatically handles:
- Request rate limiting (50 RPM)
- Input token limiting (40,000 ITPM)
- Output token limiting (8,000 OTPM)

### 2. Logging System
Provides comprehensive logging:
- Operation start/end times
- Rate limit delays
- Errors and exceptions
- Usage statistics

### 3. Usage Reporting
Automatic tracking of:
- Request counts
- Token usage
- Delays
- Performance metrics

## Usage Examples

### Basic Operation
```python
from echo_operations import EchoOperations

echo_ops = EchoOperations()

# Execute single operation
result = echo_ops.execute_operation(
    "Operation Name",
    input_tokens=100,
    output_tokens=50,
    operation_func=your_function,
    args=(arg1, arg2),
    kwargs={'key': 'value'}
)
```

### Batch Operations
```python
# Define batch operations
operations = [
    {
        'name': "Operation 1",
        'input_tokens': 100,
        'output_tokens': 50,
        'function': func1,
        'args': (arg1,)
    },
    {
        'name': "Operation 2",
        'input_tokens': 200,
        'output_tokens': 75,
        'function': func2,
        'kwargs': {'key': 'value'}
    }
]

# Execute batch
results = echo_ops.safe_execute_batch(operations)
```

### Usage Reporting
```python
# Generate usage report
report = echo_ops.get_usage_report()
```

## Configuration

### Rate Limits
Configured in `config.json`:
```json
{
  "rate_limits": {
    "requests_per_minute": 50,
    "input_tokens_per_minute": 40000,
    "output_tokens_per_minute": 8000
  }
}
```

### Logging
Logs are stored in the specified log directory:
- Operation logs: `echo_operations.log`
- Usage reports: `usage_report_[timestamp].json`

## Best Practices

1. Token Estimation
   - Estimate token counts accurately
   - Include safety margins
   - Monitor actual usage

2. Batch Operations
   - Group related operations
   - Balance batch sizes
   - Handle errors appropriately

3. Error Handling
   - Implement retry logic
   - Log all errors
   - Monitor failure patterns

## Monitoring

1. Real-time Monitoring
   - Check current usage percentages
   - Monitor delay patterns
   - Track error rates

2. Usage Reports
   - Review periodic reports
   - Analyze usage patterns
   - Optimize operations

## Troubleshooting

1. Rate Limit Issues
   - Check usage reports
   - Adjust batch sizes
   - Implement backoff strategies

2. Performance Issues
   - Monitor operation durations
   - Check log files
   - Analyze delay patterns

3. Error Resolution
   - Check error logs
   - Verify token estimates
   - Test rate limit compliance