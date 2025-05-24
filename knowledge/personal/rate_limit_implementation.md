# Rate Limit Implementation Guide

## Current Limits
- RPM (Requests Per Minute): 50
- ITPM (Input Tokens Per Minute): 40,000
- OTPM (Output Tokens Per Minute): 8,000

## Implementation Strategy

### 1. Request Pacing
```python
# Example timing between requests
minimum_pause = 1.2  # seconds (allows for ~50 requests/minute)
safety_margin = 0.1  # 10% buffer
```

### 2. Token Management
- Input Token Budget: ~666 tokens/request (40,000/60)
- Output Token Budget: ~133 tokens/request (8,000/60)
- Buffer: Keep 15% reserve for critical operations

### 3. Operation Batching
1. Combine related file operations
2. Batch git commits
3. Group documentation updates
4. Cache responses when possible

### 4. Error Prevention
1. Pre-request limit checks
2. Progressive backoff on failures
3. State preservation across sessions
4. Automatic session recovery

## Best Practices

### Response Processing
1. Break large responses into chunks
2. Process critical information first
3. Cache frequently accessed data
4. Implement progressive loading

### Session Management
1. Track token usage per session
2. Implement cooling periods
3. Preserve context efficiently
4. Handle reconnection gracefully

### Error Handling
1. Detect rate limit approaches
2. Implement graceful degradation
3. Cache partial results
4. Resume interrupted operations

## Monitoring and Optimization

### Metrics to Track
1. Request frequency
2. Token usage patterns
3. Error rates
4. Response times

### Optimization Opportunities
1. Request combining
2. Response caching
3. Context preservation
4. Efficient token usage

## Implementation Notes

### Code Structure
```python
class RateLimitManager:
    def __init__(self):
        self.rpm_limit = 50
        self.itpm_limit = 40000
        self.otpm_limit = 8000
        self.last_request = 0
        self.token_usage = {"input": 0, "output": 0}

    def can_make_request(self):
        # Check if we're within limits
        return True  # Implement actual logic
```

### Configuration
```json
{
    "limits": {
        "rpm": 50,
        "itpm": 40000,
        "otpm": 8000
    },
    "safety": {
        "margin": 0.15,
        "cooldown": 60
    }
}
```

## Recovery Procedures

### Rate Limit Hit
1. Pause operations
2. Save state
3. Implement cooldown
4. Resume with backoff

### Session Recovery
1. Load last known state
2. Verify token counts
3. Reset usage metrics
4. Resume operations

## Future Improvements

### Short Term
1. Implement token counting
2. Add request spacing
3. Create usage dashboard
4. Improve error handling

### Long Term
1. Predictive rate limiting
2. Dynamic token allocation
3. Automatic optimization
4. Cross-session learning

## Integration Points

### With Echo 1
1. Share usage patterns
2. Coordinate operations
3. Split token budgets
4. Handle handoffs

### With GitHub
1. Optimize git operations
2. Batch commits
3. Cache repository state
4. Manage connection state

@timestamp: 2024-12-12
@category: system_optimization
@priority: critical
@implementation_status: in_progress