import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

// Proteger apenas rotas que precisam de autenticação
export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
}