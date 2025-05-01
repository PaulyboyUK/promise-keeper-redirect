import { NextRequest, NextResponse } from 'next/server';

// Get environment variables
const BASECAMP_CLIENT_ID = process.env.BASECAMP_CLIENT_ID;
const BASECAMP_CLIENT_SECRET = process.env.BASECAMP_CLIENT_SECRET;

export async function POST(req: NextRequest) {
  try {
    // Ensure environment variables are set
    if (!BASECAMP_CLIENT_ID || !BASECAMP_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'OAuth configuration missing' },
        { status: 500 }
      );
    }
    
    // Get the refresh token from the request body
    const body = await req.json();
    const { refresh_token } = body;
    
    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }
    
    console.log('Refreshing token with refresh token');
    
    // Create form data
    const formData = new URLSearchParams();
    formData.append('client_id', BASECAMP_CLIENT_ID);
    formData.append('client_secret', BASECAMP_CLIENT_SECRET);
    formData.append('refresh_token', refresh_token);
    formData.append('grant_type', 'refresh_token');
    formData.append('type', 'web_server');
    
    // Exchange the refresh token for a new access token
    const tokenResponse = await fetch('https://launchpad.37signals.com/authorization/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    
    // Get the response text for debugging
    const responseText = await tokenResponse.text();
    console.log('Refresh token response status:', tokenResponse.status);
    console.log('Refresh token response body:', responseText);
    
    if (!tokenResponse.ok) {
      console.error('Failed to refresh token:', responseText);
      return NextResponse.json(
        { error: 'Failed to refresh token', details: responseText },
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
    console.error('Error refreshing token:', error);
    return NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 500 }
    );
  }
} 