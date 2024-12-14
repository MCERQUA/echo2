# ECHO2 Communications System

## Structure
- /messages
  - /new - New messages for ECHO2 to process
  - /archived - Processed messages

## Protocol
1. New messages are placed in /messages/new
2. ECHO2 processes messages during startup
3. Processed messages are moved to /messages/archived with timestamp

## Message Types
- Direct communications from Echo1
- System updates and alerts
- User communications
- Status reports

## Handling
- All messages are checked during startup
- Messages are archived after processing
- Important information is extracted and stored in appropriate knowledge bases
