# Basecamp OAuth API Endpoints

This directory contains API endpoints for handling Basecamp OAuth authentication flows, allowing the Promise Keeper iOS app to authenticate with Basecamp without storing sensitive credentials in the client app.

## Endpoints

1. **`/api/basecamp/auth`** - Initiates OAuth flow
   - Method: GET
   - Returns: JSON with Basecamp authorization URL

2. **`/api/basecamp/token`** - Exchanges authorization code for access token
   - Method: POST
   - Body: `{ "code": "authorization_code_from_basecamp" }`
   - Returns: JSON with access token, refresh token, etc.

3. **`/api/basecamp/refresh`** - Refreshes an expired access token
   - Method: POST
   - Body: `{ "refresh_token": "refresh_token_from_previous_auth" }`
   - Returns: JSON with new access token, refresh token, etc.

4. **`/api/basecamp/callback`** - Handles OAuth redirect from Basecamp
   - Method: GET
   - Redirects to iOS app using custom URL scheme

## Setup

1. Create a `.env.local` file in the root directory with the following variables:
   ```
   BASECAMP_CLIENT_ID=your_client_id_here
   BASECAMP_CLIENT_SECRET=your_client_secret_here
   BASECAMP_REDIRECT_URI=http://localhost:3000/api/basecamp/callback
   ```

2. For production, add these environment variables to your Vercel project settings.

## iOS App Integration

1. Register a custom URL scheme in your iOS app (e.g., `promisekeeper://`)

2. Implement the OAuth flow in your app:
   - Call `/api/basecamp/auth` to get the authorization URL
   - Open the URL in a web view or browser
   - Handle the callback via your custom URL scheme
   - Send the received code to `/api/basecamp/token` to get the access token
   - Store the tokens securely in the iOS Keychain
   - When tokens expire, use `/api/basecamp/refresh` to get new ones

## Security Considerations

- Never log or expose the client secret
- Use HTTPS in production
- Implement CSRF protection using the state parameter
- Store tokens securely in the iOS Keychain
- Validate tokens before use 