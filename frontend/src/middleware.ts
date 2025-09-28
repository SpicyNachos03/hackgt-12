import type { NextRequest } from 'next/server';

// Middleware temporarily disabled - Auth0 routes work, but session management needs implementation
export function middleware(request: NextRequest) {
  // TODO: Implement session verification once callback handling is complete
  console.log('Middleware called for:', request.nextUrl.pathname);
  return;
}

export const config = {
  matcher: ["/routes/chat-page", "/dashboard/:path*"], // Protected routes
};
