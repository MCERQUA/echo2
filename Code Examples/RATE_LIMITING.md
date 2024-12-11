# Rate Limiting Implementation Guide

## Overview
This document describes the rate limiting implementation for ECHO2's operations to comply with the following limits:
- 50 Requests Per Minute (RPM)
- 40,000 Input Tokens Per Minute (ITPM)
- 8,000 Output Tokens Per Minute (OTPM)

## Implementation Details

### Key Features
1. Request Rate Limiting
   - Enforces minimum 1.2-second delay between requests
   - Tracks rolling 60-second window
   - Prevents exceeding 50 requests per minute

2. Token Usage Management
   - Monitors input and output token usage
   - Maintains separate tracking for input/output limits
   - Implements sliding window for accurate tracking

3. Usage Monitoring
   - Provides real-time usage statistics
   - Helps prevent limit violations
   - Enables proactive rate management

## Best Practices

### Operation Guidelines
1. Batch Operations
   - Combine related requests when possible
   - Process in chunks to maximize efficiency
   - Cache results when appropriate

2. Token Management
   - Monitor token usage proactively
   - Prioritize operations based on token cost
   - Buffer critical operations

3. Request Spacing
   - Maintain minimum 1.2s between requests
   - Use adaptive delays based on current usage
   - Implement exponential backoff when approaching limits

### Implementation Example
```python
# Initialize rate limiter
limiter = RateLimiter()

# Before operation
delays = limiter.check_limits(input_tokens=1000, output_tokens=200)
max_delay = max(delays.values())
if max_delay > 0:
    time.sleep(max_delay)

# After operation
limiter.record_operation(input_tokens=1000, output_tokens=200)

# Monitor usage
usage = limiter.get_current_usage()
```

## Monitoring and Maintenance

### Usage Tracking
- Regular monitoring of usage patterns
- Adjustment of delays based on actual usage
- Logging of rate limit events

### Optimization Opportunities
1. Request Optimization
   - Combine similar requests
   - Cache frequently used responses
   - Implement request prioritization

2. Token Optimization
   - Compress responses where possible
   - Implement token-efficient response formats
   - Buffer non-critical operations

## Error Handling

### Rate Limit Violations
1. Implement exponential backoff
2. Log rate limit events
3. Prioritize critical operations
4. Buffer non-critical operations

### Recovery Procedures
1. Pause operations when limits approached
2. Implement request queuing
3. Maintain operation priority list
4. Handle failed requests gracefully

## Implementation Steps

1. Initialize Rate Limiter
```python
limiter = RateLimiter()
```

2. Check Before Operations
```python
delays = limiter.check_limits(input_tokens=X, output_tokens=Y)
if any(delays.values()):
    time.sleep(max(delays.values()))
```

3. Record Operations
```python
limiter.record_operation(input_tokens=X, output_tokens=Y)
```

4. Monitor Usage
```python
usage = limiter.get_current_usage()
print(f"Current usage: {usage}")
```