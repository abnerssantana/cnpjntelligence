import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const pathname = req.nextUrl.pathname
    
    // Páginas públicas de autenticação
    const isAuthPage = pathname === "/login" || pathname.startsWith("/auth")
    
    // Se está em página de auth e já está autenticado, redireciona para dashboard
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
    
    // Se não está autenticado e não está em página de auth, redireciona para login
    if (!isAuth && !isAuthPage) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true
    },
  }
)

// Proteger rotas específicas
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}