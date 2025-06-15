import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Search, Database, TrendingUp } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">CNPJntelligence</h1>
            </div>
            <Link href="/login">
              <Button>Entrar</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            Consulte dados de empresas brasileiras
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Acesse informações atualizadas de CNPJs diretamente da Receita Federal.
            Simples, rápido e confiável.
          </p>
          <Link href="/login">
            <Button size="lg" className="gap-2">
              <Search className="h-5 w-5" />
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">
            Recursos Principais
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Database className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Dados Atualizados</CardTitle>
                <CardDescription>
                  Informações sincronizadas com a base da Receita Federal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acesse dados de razão social, endereço, sócios, capital social,
                  CNAEs e muito mais.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Search className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Busca Inteligente</CardTitle>
                <CardDescription>
                  Pesquise por CNPJ ou razão social
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sistema de busca rápido e eficiente para encontrar as empresas
                  que você precisa.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Dashboard Simples</CardTitle>
                <CardDescription>
                  Visualize estatísticas e métricas importantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Interface limpa e intuitiva para análise rápida de dados
                  empresariais.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-4">
            Pronto para começar?
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            Faça login e comece a consultar dados de empresas agora mesmo.
          </p>
          <Link href="/login">
            <Button size="lg" variant="default">
              Acessar Plataforma
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 CNPJntelligence. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}