import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Search, BarChart3, CheckCircle, ArrowRight, Database } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-1xl sm:text-2xl font-bold text-foreground">CNPJntelligence</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="default" className="">
                  Entrar
                </Button>
              </Link>

            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 px-4 py-2 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
            <Database className="h-4 w-4 mr-2" />
            23+ milhões de empresas brasileiras
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6 text-foreground leading-tight">
            Encontre qualquer empresa do Brasil
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Busque, filtre e analise dados completos de CNPJs. 
            Simples, rápido e direto ao ponto.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-4 text-lg gap-3 mt-8">
              <Search className="h-5 w-5" />
              Buscar Empresas Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Busca Inteligente</h3>
              <p className="text-muted-foreground">
                Encontre empresas por CNPJ, razão social ou filtros avançados
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Dados Completos</h3>
              <p className="text-muted-foreground">
                Informações atualizadas da Receita Federal em tempo real
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Simples de Usar</h3>
              <p className="text-muted-foreground">
                Interface intuitiva, sem complicações ou curva de aprendizado
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="container mx-auto max-w-2xl text-center">
          <h3 className="text-4xl font-extrabold text-foreground mb-4">
            R$ 89/ano
          </h3>
          <p className="text-base sm:text-xl text-muted-foreground mb-6">
            Acesso completo. Sem limites. Sem complicações.
          </p>
          
          <Card className="border-0 shadow-lg bg-card">
            <CardContent className="p-8">
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-foreground/80">23+ milhões de empresas brasileiras</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-foreground/80">Busca ilimitada por CNPJ e razão social</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-foreground/80">Dados atualizados da Receita Federal</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-foreground/80">Suporte por email</span>
                  </div>
                </div>
              
              <Link href="/login">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-4 text-lg">
                  Começar Agora
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6 bg-background">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-foreground">CNPJntelligence</span>
            </div>
            <p className="text-xs text-muted-foreground">
              &copy; 2024 CNPJntelligence. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}