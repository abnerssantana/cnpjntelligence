"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  BarChart3,
  Users,
  TrendingUp,
  Search,
  Download,
  Shield,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Database,
} from "lucide-react"
import Link from "next/link"

export function HomePage() {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalPartners: 0,
    totalCapital: 0,
    states: 0,
    cities: 0,
    cnaes: 0,
    lastUpdate: "",
  })

  useEffect(() => {
    // Simulate loading global stats
    const loadStats = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStats({
        totalCompanies: 54789123,
        activeCompanies: 41234567,
        totalPartners: 28456789,
        totalCapital: 2847000000000,
        states: 27,
        cities: 5570,
        cnaes: 1358,
        lastUpdate: "2025",
      })
    }
    loadStats()
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}B`
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}k`
    }
    return num.toLocaleString("pt-BR")
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value)
  }

  const features = [
    {
      icon: <Search className="h-8 w-8 text-blue-600" />,
      title: "Busca Avançada",
      description: "Filtros por UF, município, CNAE, porte, situação cadastral e muito mais",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      title: "Análises Completas",
      description: "CNAE, geográfica, temporal, sócios, capital social e análise de concorrência",
    },
    {
      icon: <Users className="h-8 w-8 text-purple-600" />,
      title: "Rede de Sócios",
      description: "Identifique grupos empresariais e sócios com múltiplas empresas",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-orange-600" />,
      title: "Análise Temporal",
      description: "Evolução histórica, sazonalidade e previsões de mercado",
    },
    {
      icon: <Download className="h-8 w-8 text-red-600" />,
      title: "Exportação",
      description: "Exporte dados em Excel, CSV com filtros personalizados",
    },
    {
      icon: <Shield className="h-8 w-8 text-indigo-600" />,
      title: "Compliance",
      description: "Alertas de situações suspeitas e análise de risco",
    },
  ]

  const useCases = [
    {
      title: "Prospecção de Clientes",
      description: "Encontre empresas do seu segmento por região, porte e atividade",
      icon: <Building2 className="h-6 w-6" />,
    },
    {
      title: "Análise de Concorrência",
      description: "Identifique concorrentes diretos e indiretos no seu mercado",
      icon: <BarChart3 className="h-6 w-6" />,
    },
    {
      title: "Due Diligence",
      description: "Verifique sócios, capital social e histórico das empresas",
      icon: <Shield className="h-6 w-6" />,
    },
    {
      title: "Estudos de Mercado",
      description: "Analise tendências, sazonalidade e oportunidades de negócio",
      icon: <TrendingUp className="h-6 w-6" />,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold">CNPJ Analytics</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Entrar</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Começar Grátis</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="secondary" className="mb-4">
            <Database className="h-4 w-4 mr-2" />
            Dados atualizados - {stats.lastUpdate}
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Business Intelligence
            <br />
            para Dados CNPJ
          </h1>

          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Acesse e analise mais de <strong>{formatNumber(stats.totalCompanies)}</strong> empresas brasileiras.
            Identifique oportunidades, analise concorrentes e tome decisões baseadas em dados.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8">
                Começar Análise Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-lg px-8">
                Ver Funcionalidades
              </Button>
            </Link>
          </div>

          {/* Global Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.totalCompanies)}</div>
                <div className="text-sm text-gray-600">Empresas</div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{formatNumber(stats.activeCompanies)}</div>
                <div className="text-sm text-gray-600">Ativas</div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{formatNumber(stats.totalPartners)}</div>
                <div className="text-sm text-gray-600">Sócios</div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalCapital)}</div>
                <div className="text-sm text-gray-600">Capital Total</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Funcionalidades Completas</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Todas as ferramentas que você precisa para análise empresarial em uma única plataforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Casos de Uso</h2>
            <p className="text-xl text-gray-600">
              Como profissionais usam nossa plataforma para impulsionar seus negócios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg text-blue-600">{useCase.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{useCase.title}</h3>
                    <p className="text-gray-600">{useCase.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Preço Simples e Transparente</h2>
            <p className="text-xl text-gray-600">Acesso completo a todos os dados e funcionalidades</p>
          </div>

          <div className="max-w-lg mx-auto">
            <Card className="relative overflow-hidden border-2 border-blue-500 shadow-2xl">
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-2">
                <span className="font-semibold">🔥 OFERTA ESPECIAL</span>
              </div>

              <CardHeader className="text-center pt-12">
                <CardTitle className="text-3xl">Plano Anual</CardTitle>
                <div className="mt-4">
                  <span className="text-5xl font-bold">R$ 89</span>
                  <span className="text-gray-600">/ano</span>
                </div>
                <p className="text-gray-600 mt-2">Apenas R$ 7,42 por mês</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    "Acesso a 54M+ empresas brasileiras",
                    "Todas as análises e filtros",
                    "Exportação ilimitada de dados",
                    "Análise de sócios e concorrentes",
                    "Dados atualizados mensalmente",
                    "Suporte por email",
                    "Sem limite de consultas",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6">
                  <Link href="/auth/register">
                    <Button className="w-full text-lg py-6" size="lg">
                      Começar Agora - R$ 89/ano
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <p className="text-center text-sm text-gray-600 mt-3">
                    💳 Pagamento seguro • ⚡ Ativação imediata • 🔒 Dados protegidos
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-800 px-4 py-2 rounded-full">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Teste grátis por 7 dias</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Confiado por Profissionais</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Carlos Silva",
                role: "Consultor Empresarial",
                comment:
                  "Economizo 10+ horas por semana na prospecção de clientes. Os dados são precisos e atualizados.",
                rating: 5,
              },
              {
                name: "Ana Santos",
                role: "Analista de Mercado",
                comment:
                  "Ferramenta essencial para análise de concorrência. Interface intuitiva e relatórios completos.",
                rating: 5,
              },
              {
                name: "Roberto Lima",
                role: "Investidor",
                comment: "Due diligence nunca foi tão fácil. Consigo analisar empresas e sócios em minutos.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Pronto para Transformar sua Análise Empresarial?</h2>
          <p className="text-xl mb-8 opacity-90">Junte-se a centenas de profissionais que já usam nossa plataforma</p>
          <Link href="/auth/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Começar Teste Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6" />
                <span className="text-xl font-bold">CNPJ Analytics</span>
              </div>
              <p className="text-gray-400">A plataforma mais completa para análise de dados empresariais do Brasil.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Produto</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#features" className="hover:text-white">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white">
                    Preços
                  </a>
                </li>
                <li>
                  <Link href="/auth/register" className="hover:text-white">
                    Teste Grátis
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="mailto:suporte@cnpjanalytics.com" className="hover:text-white">
                    Contato
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Documentação
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    LGPD
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CNPJ Analytics. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
