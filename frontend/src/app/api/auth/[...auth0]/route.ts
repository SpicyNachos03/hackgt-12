import { NextRequest } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: Promise<{ auth0: string[] }> }) {
  try {
    const { auth0 } = await params;
    const route = auth0?.[0];
    const url = new URL(request.url);
    
    switch (route) {
      case 'login':
        // Redirect to Auth0 login
        const domain = process.env.AUTH0_DOMAIN;
        const clientId = process.env.AUTH0_CLIENT_ID;
        const baseUrl = process.env.APP_BASE_URL;
        
        if (!domain || !clientId || !baseUrl) {
          return new Response('Missing Auth0 configuration', { status: 500 });
        }
        
        const loginUrl = new URL(`https://${domain}/authorize`);
        loginUrl.searchParams.set('client_id', clientId);
        loginUrl.searchParams.set('response_type', 'code');
        loginUrl.searchParams.set('redirect_uri', `${baseUrl}/api/auth/callback`);
        loginUrl.searchParams.set('scope', 'openid profile email');
        
        // Handle returnTo parameter
        const returnTo = url.searchParams.get('returnTo');
        if (returnTo) {
          loginUrl.searchParams.set('state', returnTo);
        }
        
        return Response.redirect(loginUrl.toString());
      
    case 'logout':
      // Redirect to Auth0 logout
      const logoutUrl = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
      logoutUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
      logoutUrl.searchParams.set('returnTo', process.env.APP_BASE_URL!);
      
      // Create redirect response with headers
      const headers = new Headers();
      headers.set('Location', logoutUrl.toString());
      headers.set('Set-Cookie', '__session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax');
      
      return new Response(null, {
        status: 302,
        headers: headers
      });
      
    case 'callback':
      // Handle the state parameter to redirect to the correct page after auth
      const state = url.searchParams.get('state');
      const redirectTo = state || '/routes/chat-page'; // Default to chat page
      return Response.redirect(`${process.env.APP_BASE_URL}${redirectTo}`);
      
    default:
      return new Response('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error('Auth0 route error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
