import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Filter, BarChart3, MapPin, Briefcase, TrendingUp, Check, Database, Zap } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">CNPJntelligence</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="#pricing">
                <Button>Assinar Agora</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-4" variant="secondary">
            Base de dados com mais de 23 milhões de empresas
          </Badge>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Inteligência de Mercado com Dados de CNPJs
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Filtre e analise empresas por estado, cidade, porte, categoria e CNAE. 
            Identifique oportunidades, concorrentes e tendências de mercado.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="#pricing">
              <Button size="lg" className="gap-2">
                <Zap className="h-5 w-5" />
                Começar Agora - R$ 89/ano
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Ver Recursos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Ferramentas Poderosas de Análise
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Acesse dados completos e atualizados para tomar decisões estratégicas
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="border-primary/20">
              <CardHeader>
                <Filter className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Filtros Avançados</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Filtrar por Estado e Cidade
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Segmentar por Porte da Empresa
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Buscar por CNAE específico
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Cruzar múltiplos filtros
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Indicadores de Mercado</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Empresas abertas vs fechadas
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Análise de concorrência
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Tendências por região
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Estatísticas por CNAE
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <Database className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Base Completa</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Dados da Receita Federal
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Atualizações periódicas
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Exportação de dados
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    API para integração
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Use Cases */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-4">
              <div className="flex gap-4">
                <MapPin className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Análise Regional</h4>
                  <p className="text-sm text-muted-foreground">
                    Identifique oportunidades de negócio por região, analisando a 
                    concentração de empresas e setores em crescimento.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Briefcase className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Prospecção B2B</h4>
                  <p className="text-sm text-muted-foreground">
                    Encontre potenciais clientes filtrando por porte, setor e 
                    localização para suas campanhas de vendas.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <TrendingUp className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Análise Competitiva</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitore concorrentes diretos através de CNAEs similares e 
                    acompanhe o crescimento do setor.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <BarChart3 className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Estudos de Mercado</h4>
                  <p className="text-sm text-muted-foreground">
                    Gere relatórios detalhados sobre setores específicos para 
                    embasar decisões estratégicas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Plano Simples e Transparente
            </h3>
            <p className="text-muted-foreground">
              Acesso completo a todas as funcionalidades por um preço justo
            </p>
          </div>

          <Card className="max-w-md mx-auto border-primary/20">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Acesso Anual</CardTitle>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold">R$ 89</span>
                <span className="text-muted-foreground">/ano</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Acesso ilimitado à base de dados</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Todos os filtros e segmentações</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Indicadores e análises em tempo real</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Exportação de dados em Excel/CSV</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-primary flex-shrink-0" />
                  <span>Suporte por email</span>
                </li>
              </ul>
              <div className="pt-4">
                <Link href="/login" className="block">
                  <Button size="lg" className="w-full">
                    Assinar Agora
                  </Button>
                </Link>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Cancele quando quiser • Garantia de 7 dias
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto text-center max-w-2xl">
          <h3 className="text-3xl font-bold mb-4">
            Transforme Dados em Decisões Inteligentes
          </h3>
          <p className="text-xl text-muted-foreground mb-8">
            Junte-se a milhares de empresários e analistas que já utilizam o 
            CNPJntelligence para impulsionar seus negócios.
          </p>
          <Link href="/login">
            <Button size="lg" className="gap-2">
              <Building2 className="h-5 w-5" />
              Começar Teste Gratuito
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-semibold">CNPJntelligence</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; 2024 CNPJntelligence. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}