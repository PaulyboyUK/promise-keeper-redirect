import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code not received' },
        { status: 400 }
      );
    }
    
    // In a real implementation, you'd validate the state parameter here
    // to prevent CSRF attacks
    
    // Create an HTML page that communicates the code back to the iOS app
    // The iOS app would have registered a custom URL scheme to handle this callback
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication Successful</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script>
        // This will redirect to your iOS app with the authorization code
        window.location.href = "promisekeeper://oauth/callback?code=${code}&state=${state || ''}";
      </script>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          padding: 20px;
          text-align: center;
          background-color: #f5f5f7;
        }
        h1 {
          margin-bottom: 20px;
          color: #1d1d1f;
        }
        p {
          color: #86868b;
          margin-bottom: 30px;
        }
      </style>
    </head>
    <body>
      <h1>Authentication Successful</h1>
      <p>Redirecting back to Promise Keeper app...</p>
    </body>
    </html>
    `;
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error handling OAuth callback:', error);
    return NextResponse.json(
      { error: 'Failed to process authentication callback' },
      { status: 500 }
    );
  }
} 