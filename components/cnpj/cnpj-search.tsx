'use client';

import { useState } from 'react';
import { Search, Loader2, Building2, Users, FileText, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getEmpresaByCNPJ, type Empresa } from '@/lib/api/cnpj';
import { formatCNPJ, formatCurrency, formatDate } from '@/lib/utils';

export function CNPJSearch() {
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!cnpj) return;

    setLoading(true);
    setError(null);
    setEmpresa(null);

    try {
      const data = await getEmpresaByCNPJ(cnpj);
      if (data) {
        setEmpresa(data);
      } else {
        setError('CNPJ não encontrado');
      }
    } catch (err) {
      setError('Erro ao buscar CNPJ. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Consulta de CNPJ</CardTitle>
          <CardDescription>
            Digite um CNPJ para buscar informações atualizadas da empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="00.000.000/0000-00"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </Button>
          </div>
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </CardContent>
      </Card>

      {empresa && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{empresa.razao_social}</CardTitle>
                {empresa.nome_fantasia && (
                  <CardDescription className="text-lg mt-1">
                    {empresa.nome_fantasia}
                  </CardDescription>
                )}
              </div>
              <Badge
                variant={empresa.situacao_cadastral === 2 ? 'default' : 'secondary'}
              >
                {empresa.descricao_situacao_cadastral}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="address">Endereço</TabsTrigger>
                <TabsTrigger value="partners">Sócios</TabsTrigger>
                <TabsTrigger value="activities">Atividades</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">CNPJ</p>
                    <p className="font-medium">{formatCNPJ(empresa.cnpj)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Natureza Jurídica</p>
                    <p className="font-medium">{empresa.natureza_juridica}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Capital Social</p>
                    <p className="font-medium">{formatCurrency(empresa.capital_social)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Porte</p>
                    <p className="font-medium">{empresa.porte}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Início das Atividades</p>
                    <p className="font-medium">{formatDate(empresa.data_inicio_atividade)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Situação Cadastral</p>
                    <p className="font-medium">
                      {empresa.descricao_situacao_cadastral} desde {formatDate(empresa.data_situacao_cadastral)}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="address" className="space-y-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium">
                      {empresa.logradouro}, {empresa.numero}
                      {empresa.complemento && ` - ${empresa.complemento}`}
                    </p>
                    <p>{empresa.bairro}</p>
                    <p>
                      {empresa.municipio} - {empresa.uf} - CEP: {empresa.cep}
                    </p>
                    {empresa.email && (
                      <p className="text-sm text-muted-foreground">{empresa.email}</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="partners" className="space-y-4">
                {empresa.empresa_socios && empresa.empresa_socios.length > 0 ? (
                  <div className="space-y-3">
                    {empresa.empresa_socios.map((socio, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 rounded-lg border">
                        <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{socio.nome_socio}</p>
                          <p className="text-sm text-muted-foreground">
                            {socio.qualificacao_socio} - {socio.faixa_etaria}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Entrada: {formatDate(socio.data_entrada_sociedade)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum sócio cadastrado</p>
                )}
              </TabsContent>

              <TabsContent value="activities" className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Atividade Principal</h4>
                  <div className="flex items-start gap-2 p-3 rounded-lg border">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{empresa.cnae_fiscal}</p>
                      <p className="text-sm text-muted-foreground">
                        {empresa.cnae_fiscal_descricao}
                      </p>
                    </div>
                  </div>
                </div>

                {empresa.empresa_cnaes_secundarios && empresa.empresa_cnaes_secundarios.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Atividades Secundárias</h4>
                    <div className="space-y-2">
                      {empresa.empresa_cnaes_secundarios.map((cnae, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 rounded-lg border">
                          <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">{cnae.codigo}</p>
                            <p className="text-sm text-muted-foreground">{cnae.descricao}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground">
                Última atualização: {formatDate(empresa.last_api_sync)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}