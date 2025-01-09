# Session Learnings - December 11, 2024

## Rate Limiting Insights
- Discovered 40,000 tokens per minute limit
- Need to implement systematic pauses between operations
- Multiple operations between user messages count toward limit
- Should batch similar operations when possible

## Technical Improvements Needed
- Consider adding to startup:
  ```bash
  mkdir -p /tmp/ECHO2/website-structure/{core,procedures,programs}
  ```
- Could benefit from having common text processing tools:
  - wc
  - sed
  - grep
  - jq (for JSON processing)

## Process Improvements
1. Implement standardized delays:
   - 5-second minimum between file operations
   - 10-second pause between major operations
   - Group similar operations when possible

2. Operation Batching Strategy:
   - Combine related file creations
   - Process similar content together
   - Group metadata operations

3. Content Processing Approach:
   - Break large sections into smaller chunks
   - Process one major component per session
   - Maintain progress markers

## Repository Organization Guidelines
1. All client-specific folders should be stored in the 'Client Files' directory
2. Moved 'cortez' folder to 'Client Files' on January 9, 2025
3. This organization helps maintain a clean and structured repository

## Questions for Future Sessions
1. How to track token usage more effectively?
2. What's the optimal pause duration between operations?
3. How to better structure multi-step operations?