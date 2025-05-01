import { NextRequest, NextResponse } from 'next/server';

// Get environment variables
const BASECAMP_CLIENT_ID = process.env.BASECAMP_CLIENT_ID;
const BASECAMP_CLIENT_SECRET = process.env.BASECAMP_CLIENT_SECRET;
const BASECAMP_REDIRECT_URI = process.env.BASECAMP_REDIRECT_URI;

export async function POST(req: NextRequest) {
  try {
    // Ensure environment variables are set
    if (!BASECAMP_CLIENT_ID || !BASECAMP_CLIENT_SECRET || !BASECAMP_REDIRECT_URI) {
      return NextResponse.json(
        { error: 'OAuth configuration missing' },
        { status: 500 }
      );
    }
    
    // Get the authorization code from the request body
    const body = await req.json();
    const { code } = body;
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }
    
    console.log('Exchanging code for token with:', { 
      client_id: BASECAMP_CLIENT_ID,
      redirect_uri: BASECAMP_REDIRECT_URI,
      code: code
    });
    
    // Create form data instead of JSON
    const formData = new URLSearchParams();
    formData.append('client_id', BASECAMP_CLIENT_ID);
    formData.append('client_secret', BASECAMP_CLIENT_SECRET);
    formData.append('code', code);
    formData.append('redirect_uri', BASECAMP_REDIRECT_URI);
    formData.append('grant_type', 'authorization_code');
    formData.append('type', 'web_server');
    
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://launchpad.37signals.com/authorization/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    // Get the response text for debugging
    const responseText = await tokenResponse.text();
    console.log('Token response status:', tokenResponse.status);
    console.log('Token response body:', responseText);
    
    if (!tokenResponse.ok) {
      console.error('Failed to exchange code for token:', responseText);
      return NextResponse.json(
        { error: 'Failed to exchange code for token', details: responseText },
        { status: tokenResponse.status }
      );
    }
    
    // Try to parse the JSON response
    let tokenData;
    try {
      tokenData = JSON.parse(responseText);
    } catch (error) {
      console.error('Failed to parse token response as JSON:', error);
      return NextResponse.json(
        { error: 'Invalid token response format', details: responseText },
        { status: 500 }
      );
    }
    
    return NextResponse.json(tokenData);
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    return NextResponse.json(
      { error: 'Failed to exchange code for token' },
      { status: 500 }
    );
  }
} 