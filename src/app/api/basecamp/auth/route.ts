import { NextRequest, NextResponse } from 'next/server';

// Get environment variables
const BASECAMP_CLIENT_ID = process.env.BASECAMP_CLIENT_ID;
const BASECAMP_REDIRECT_URI = process.env.BASECAMP_REDIRECT_URI;

export async function GET(req: NextRequest) {
  try {
    // Ensure environment variables are set
    if (!BASECAMP_CLIENT_ID || !BASECAMP_REDIRECT_URI) {
      return NextResponse.json(
        { error: 'OAuth configuration missing' },
        { status: 500 }
      );
    }
    
    // Get the state parameter to prevent CSRF
    const url = new URL(req.url);
    const state = url.searchParams.get('state') || '';
    
    // Construct the Basecamp authorization URL
    const authUrl = new URL('https://launchpad.37signals.com/authorization/new');
    authUrl.searchParams.append('client_id', BASECAMP_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', BASECAMP_REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('type', 'web_server');
    
    // Return the authorization URL
    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error('Error initiating Basecamp OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
} 