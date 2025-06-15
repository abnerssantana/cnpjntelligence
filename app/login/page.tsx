"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, Building2 } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Log inicial para debug
    console.log("[Login] Iniciando tentativa de login", { 
      email, 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV 
    })

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      // Log do resultado da autenticação
      console.log("[Login] Resultado da autenticação:", {
        success: !result?.error,
        error: result?.error,
        status: result?.status,
        ok: result?.ok,
        timestamp: new Date().toISOString()
      })

      if (result?.error) {
        // Log detalhado do erro
        console.error("[Login] Erro de autenticação:", {
          error: result.error,
          status: result.status,
          email,
          timestamp: new Date().toISOString()
        })
        
        // Mensagem de erro mais específica baseada no tipo de erro
        if (result.error === "CredentialsSignin") {
          setError("Email ou senha inválidos")
        } else if (result.status === 401) {
          setError("Credenciais inválidas. Verifique seu email e senha.")
        } else {
          setError(`Erro ao fazer login: ${result.error}`)
        }
      } else {
        console.log("[Login] Login bem-sucedido, redirecionando para dashboard")
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error) {
      // Log detalhado de exceções
      console.error("[Login] Exceção capturada:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        type: error instanceof Error ? error.name : typeof error,
        timestamp: new Date().toISOString()
      })
      
      // Mensagem de erro mais informativa
      const errorMessage = error instanceof Error 
        ? `Erro ao fazer login: ${error.message}` 
        : "Ocorreu um erro inesperado ao fazer login. Tente novamente."
      
      setError(errorMessage)
      
      // Enviar erro para serviço de monitoramento se disponível
      if (typeof window !== 'undefined' && (window as any).Sentry) {
        (window as any).Sentry.captureException(error, {
          tags: {
            component: 'LoginPage',
            action: 'handleSubmit'
          },
          extra: {
            email,
            timestamp: new Date().toISOString()
          }
        })
      }
    } finally {
      setIsLoading(false)
      console.log("[Login] Processo de login finalizado")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">CNPJntelligence</h1>
          </div>
          <p className="text-muted-foreground">Inteligência de dados empresariais</p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Entrar</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Não tem uma conta?{" "}
                <Link href="/auth/register" className="text-primary hover:underline font-medium">
                  Cadastre-se
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}