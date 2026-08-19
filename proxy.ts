import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  const isApiAuth = pathname.startsWith('/api/auth/')
  const isStatic = pathname.startsWith('/_next/') || pathname.startsWith('/icon') || pathname === '/favicon.ico' || pathname.endsWith('.png') || pathname.endsWith('.svg')

  if (isPublicRoute || isApiAuth || isStatic) {
    if (isPublicRoute && pathname !== '/') {
      const session = request.cookies.get('session')?.value
      if (session) {
        const payload = await decrypt(session)
        if (payload?.userId) return NextResponse.redirect(new URL('/', request.nextUrl))
      }
    }
    return NextResponse.next()
  }

  const session = request.cookies.get('session')?.value
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
