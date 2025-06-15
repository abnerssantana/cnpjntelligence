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

// Proteger todas as rotas exceto login, api/auth e arquivos estáticos
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - login (login page)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)',
  ],
}