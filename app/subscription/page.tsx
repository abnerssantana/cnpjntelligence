"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { UserNav } from "@/components/auth/user-nav"

export default function SubscriptionPage() {
  const { data: session } = useSession()

  if (!session?.user) {
    return null
  }

  const expirationDate = new Date(session.user.subscriptionExpiresAt)
  const isExpired = expirationDate < new Date()
  const daysRemaining = Math.ceil((expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">CNPJ Intelligence</h1>
            <UserNav />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Status da Assinatura</CardTitle>
            <CardDescription>
              Gerencie sua assinatura do CNPJ Intelligence
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Status Atual</p>
                <p className="text-sm text-muted-foreground">
                  {session.user.subscriptionStatus === 'active' ? 'Ativa' : 
                   session.user.subscriptionStatus === 'trial' ? 'Período de Teste' : 'Inativa'}
                </p>
              </div>
              <div>
                {session.user.isSubscriptionActive ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Data de Expiração</p>
                <p className="text-sm text-muted-foreground">
                  {expirationDate.toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isExpired ? (
                    <span className="text-red-600">Expirada</span>
                  ) : (
                    <span className="text-green-600">{daysRemaining} dias restantes</span>
                  )}
                </p>
              </div>
            </div>

            {!session.user.isSubscriptionActive && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Sua assinatura expirou. Renove para continuar acessando todos os recursos do sistema.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Planos Disponíveis</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mensal</CardTitle>
                    <CardDescription>Acesso completo por 30 dias</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">R$ 99,90</p>
                    <p className="text-sm text-muted-foreground">por mês</p>
                    <Button className="w-full mt-4" disabled>
                      Em breve
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Anual</CardTitle>
                    <CardDescription>Acesso completo por 1 ano</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">R$ 999,90</p>
                    <p className="text-sm text-muted-foreground">por ano (economia de R$ 198,90)</p>
                    <Button className="w-full mt-4" disabled>
                      Em breve
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Para renovar sua assinatura ou obter mais informações, entre em contato com o suporte.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}