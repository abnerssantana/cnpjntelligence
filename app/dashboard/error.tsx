'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-6 w-6" />
            <CardTitle>Erro ao carregar o dashboard</CardTitle>
          </div>
          <CardDescription>
            Ocorreu um erro ao carregar os dados. Por favor, tente novamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-800">
                {error.message || 'Erro desconhecido'}
              </p>
            </div>
            <Button onClick={reset} className="w-full">
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}