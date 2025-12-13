import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Allow auth routes (including the OAuth callback) through the middleware
  // to avoid intercepting provider redirects and causing a bounce.
  if (request.nextUrl.pathname.startsWith('/auth')) {
    return supabaseResponse;
  }

  // Protected routes that require authentication. Note: `/checkout` is
  // intentionally excluded so guest users can access the in-app checkout
  // UI (we create pending purchases for anonymous users and rely on
  // webhook-driven fulfillment).
  const protectedPaths = ['/dashboard', '/app', '/account'];
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Redirect to login if not authenticated and trying to access protected routes
  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    url.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If the user IS authenticated, redirect them from public pages to /app
  if (user) {
    const publicPaths = ['/', '/pricing', '/template'];
    if (publicPaths.includes(request.nextUrl.pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/app';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|mp3|webm|ogg)$).*)',
  ],
};