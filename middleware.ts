import { proxy } from './proxy';
import { type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await proxy(request);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
