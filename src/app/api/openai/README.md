# OpenAI Integration API Endpoints

This directory contains API endpoints for handling OpenAI interactions for Promise Keeper, enabling the extraction of commitments and promises from conversations in various platforms.

## Endpoints

1. **`/api/openai`** - Main endpoint for promise detection in messages
   - Method: POST
   - Body: 
   ```json
   {
     "message": "The message to analyze",
     "previousMessages": [
       {
         "id": "msg1",
         "text": "Can you review this by tomorrow?",
         "sender": "John Doe",
         "userId": "U123456",
         "timestamp": "2023-06-01T12:00:00Z",
         "conversationId": "C123456"
       }
     ],
     "source": "slack"
   }
   ```
   - Returns: JSON with detected promises

2. **`/api/openai/gmail`** - Endpoint for promise detection in Gmail threads
   - Method: POST
   - Body:
   ```json
   {
     "thread": {
       "messages": [
         {
           "from": "John Doe <john@example.com>",
           "date": "2023-06-01T12:00:00Z",
           "body": "Can you review this by tomorrow?"
         },
         {
           "from": "Jane Smith <jane@example.com>",
           "date": "2023-06-01T13:00:00Z",
           "body": "Sure, I'll get it done."
         }
       ]
     },
     "avatarMap": {
       "John Doe <john@example.com>": "https://example.com/avatar1.png",
       "Jane Smith <jane@example.com>": "https://example.com/avatar2.png"
     }
   }
   ```
   - Returns: JSON with detected promises

## Setup

1. Create a `.env.local` file in the root directory with the following variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

2. For production, add this environment variable to your Vercel project settings.

## Security Considerations

- The OpenAI API key is stored securely on the backend, not in the client app
- Input validation is applied to all requests
- Error handling provides minimal information to clients to prevent information leakage
- Rate limiting should be implemented (future enhancement)
- API monitoring should be set up to track costs and usage (future enhancement)

## iOS App Integration

Update the Promise Keeper iOS app to use these endpoints instead of calling OpenAI directly:

1. Remove the hardcoded OpenAI API key from the iOS app
2. Update `OpenAIService.swift` to call these backend endpoints instead of OpenAI directly
3. Ensure error handling is in place for API failures 