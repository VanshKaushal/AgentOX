import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Simple auth check for /dashboard
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    // For now, allow access or implement Supabase auth cookie checks
    return NextResponse.next();
  }
  
  // Basic API Key validation for CLI syncing
  if (req.nextUrl.pathname.startsWith('/api/sync') || req.nextUrl.pathname.startsWith('/api/pull')) {
    const auth = req.headers.get('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/sync', '/api/pull/:path*'],
};
