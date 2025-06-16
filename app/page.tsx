import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, Search, BarChart3, CheckCircle, ArrowRight, Database } from "lucide-react"

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">CNPJntelligence</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Entrar
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Começar Agora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 px-4 py-2 bg-green-50 text-green-700 border-green-200">
            <Database className="h-4 w-4 mr-2" />
            23+ milhões de empresas brasileiras
          </Badge>
          <h2 className="text-6xl font-bold mb-6 text-gray-900 leading-tight">
            Encontre qualquer empresa do Brasil
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Busque, filtre e analise dados completos de CNPJs. 
            Simples, rápido e direto ao ponto.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg gap-3">
              <Search className="h-5 w-5" />
              Buscar Empresas Agora
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-4 bg-blue-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Search className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Busca Inteligente</h3>
              <p className="text-gray-600">
                Encontre empresas por CNPJ, razão social ou filtros avançados
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-green-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Dados Completos</h3>
              <p className="text-gray-600">
                Informações atualizadas da Receita Federal em tempo real
              </p>
            </div>
            
            <div className="text-center">
              <div className="p-4 bg-purple-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Simples de Usar</h3>
              <p className="text-gray-600">
                Interface intuitiva, sem complicações ou curva de aprendizado
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto max-w-2xl text-center">
          <h3 className="text-4xl font-bold text-gray-900 mb-4">
            R$ 89/ano
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Acesso completo. Sem limites. Sem complicações.
          </p>
          
          <Card className="border-0 shadow-lg bg-white">
            <CardContent className="p-8">
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">23+ milhões de empresas brasileiras</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Busca ilimitada por CNPJ e razão social</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Dados atualizados da Receita Federal</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Suporte por email</span>
                </div>
              </div>
              
              <Link href="/login">
                <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg">
                  Começar Agora
                </Button>
              </Link>
              
              <p className="text-sm text-gray-500 mt-4">
                Cancele quando quiser
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">CNPJntelligence</span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; 2024 CNPJntelligence. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}