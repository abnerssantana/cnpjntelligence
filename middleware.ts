import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Se o usuário não tem assinatura ativa e não está na página de assinatura
    if (!req.nextauth.token?.isSubscriptionActive && !req.nextUrl.pathname.startsWith("/subscription")) {
      return NextResponse.redirect(new URL("/subscription", req.url))
    }
    
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

// Proteger apenas rotas específicas que precisam de autenticação
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/subscription/:path*',
    '/api/dashboard/:path*',
    '/api/subscription/:path*',
  ],
}