import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const isAuth = !!token
    const pathname = req.nextUrl.pathname
    
    // Páginas públicas: home, login e autenticação
    const isPublicPage = pathname === "/" || pathname === "/login" || pathname.startsWith("/auth")
    
    // Se está em página pública e já está autenticado, pode acessar normalmente
    if (isPublicPage) {
      // Se for página de login/auth e já autenticado, redireciona para dashboard
      if ((pathname === "/login" || pathname.startsWith("/auth")) && isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
      return NextResponse.next()
    }

    // Proteger apenas /dashboard e subrotas
    const isDashboard = pathname.startsWith("/dashboard")
    if (isDashboard && !isAuth) {
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
    '/dashboard',
    '/dashboard/(.*)',
    '/login',
    '/auth',
    '/auth/(.*)',
    '/',
  ],
}