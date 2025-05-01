import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code) {
    return new NextResponse('Missing code in query params', { status: 400 });
  }

  // Build custom URL scheme
  const base_url = "promisekeeper://auth/slack";
  const query = `code=${encodeURIComponent(code)}`;
  const redirectUrl = state 
    ? `${base_url}?${query}&state=${encodeURIComponent(state)}`
    : `${base_url}?${query}`;

  // Redirect to the custom URL scheme
  return NextResponse.redirect(redirectUrl);
} 