'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Building2, 
  Users, 
  TrendingUp, 
  MapPin,
  Loader2,
  FileText,
  Calendar
} from 'lucide-react';
import { getEmpresaByCNPJ, searchEmpresas, getEmpresasStats } from '@/lib/api/cnpj';
import { formatCNPJ, formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export function DashboardSimple() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [selectedEmpresa, setSelectedEmpresa] = useState<any>(null);
  const [stats, setStats] = useState({
    total: 0,
    ativas: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getEmpresasStats();
      setStats({
        total: data.total || 0,
        ativas: data.ativas || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLoading(true);
    setSelectedEmpresa(null);

    try {
      // Check if it's a CNPJ (only numbers)
      const cleanSearch = searchTerm.replace(/\D/g, '');
      
      if (cleanSearch.length === 14) {
        // Search by CNPJ
        const empresa = await getEmpresaByCNPJ(cleanSearch);
        if (empresa) {
          setEmpresas([empresa]);
          setSelectedEmpresa(empresa);
        } else {
          toast.error("CNPJ não encontrado", {
            description: "Tente outro CNPJ ou faça uma busca por nome."
          });
          setEmpresas([]);
        }
      } else {
        // Search by name
        const result = await searchEmpresas({
          razao_social: searchTerm,
          limit: 10
        });
        setEmpresas(result.data || []);
        if (result.data && result.data.length === 1) {
          setSelectedEmpresa(result.data[0]);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Erro na busca", {
        description: "Ocorreu um erro ao buscar. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.total.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Cadastradas no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.ativas.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              Situação cadastral ativa
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Atividade</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingStats ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                stats.total > 0 ? `${((stats.ativas / stats.total) * 100).toFixed(1)}%` : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Empresas ativas vs total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </div>
            <p className="text-xs text-muted-foreground">
              Dados sincronizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Empresa</CardTitle>
          <CardDescription>
            Digite o CNPJ (apenas números) ou razão social da empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="CNPJ ou Razão Social..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
        </CardContent>
      </Card>

      {/* Results */}
      {empresas.length > 0 && !selectedEmpresa && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Busca</CardTitle>
            <CardDescription>
              {empresas.length} empresa{empresas.length > 1 ? 's' : ''} encontrada{empresas.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {empresas.map((empresa) => (
                <div
                  key={empresa.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer"
                  onClick={() => setSelectedEmpresa(empresa)}
                >
                  <div>
                    <p className="font-medium">{empresa.razao_social}</p>
                    <p className="text-sm text-muted-foreground">
                      CNPJ: {formatCNPJ(empresa.cnpj)} • {empresa.municipio}/{empresa.uf}
                    </p>
                  </div>
                  <Badge variant={empresa.situacao_cadastral === 2 ? 'default' : 'secondary'}>
                    {empresa.descricao_situacao_cadastral}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Company Details */}
      {selectedEmpresa && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{selectedEmpresa.razao_social}</CardTitle>
                {selectedEmpresa.nome_fantasia && (
                  <CardDescription className="text-lg mt-1">
                    {selectedEmpresa.nome_fantasia}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-2">
                <Badge variant={selectedEmpresa.situacao_cadastral === 2 ? 'default' : 'secondary'}>
                  {selectedEmpresa.descricao_situacao_cadastral}
                </Badge>
                {empresas.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEmpresa(null)}
                  >
                    Ver Lista
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">CNPJ</p>
                  <p className="font-medium">{formatCNPJ(selectedEmpresa.cnpj)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Natureza Jurídica</p>
                  <p className="font-medium">{selectedEmpresa.natureza_juridica}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capital Social</p>
                  <p className="font-medium">{formatCurrency(selectedEmpresa.capital_social)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Porte</p>
                  <p className="font-medium">{selectedEmpresa.porte}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Início das Atividades</p>
                  <p className="font-medium">{formatDate(selectedEmpresa.data_inicio_atividade)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Situação Cadastral</p>
                  <p className="font-medium">
                    {selectedEmpresa.descricao_situacao_cadastral} desde {formatDate(selectedEmpresa.data_situacao_cadastral)}
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço
              </h3>
              <div className="space-y-1">
                <p>
                  {selectedEmpresa.logradouro}, {selectedEmpresa.numero}
                  {selectedEmpresa.complemento && ` - ${selectedEmpresa.complemento}`}
                </p>
                <p>{selectedEmpresa.bairro}</p>
                <p>
                  {selectedEmpresa.municipio} - {selectedEmpresa.uf} - CEP: {selectedEmpresa.cep}
                </p>
                {selectedEmpresa.email && (
                  <p className="text-sm text-muted-foreground">{selectedEmpresa.email}</p>
                )}
              </div>
            </div>

            {/* Main Activity */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Atividade Principal
              </h3>
              <div className="p-3 rounded-lg border">
                <p className="font-medium">{selectedEmpresa.cnae_fiscal}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedEmpresa.cnae_fiscal_descricao}
                </p>
              </div>
            </div>

            {/* Partners */}
            {selectedEmpresa.empresa_socios && selectedEmpresa.empresa_socios.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Quadro Societário
                </h3>
                <div className="space-y-2">
                  {selectedEmpresa.empresa_socios.map((socio: any, index: number) => (
                    <div key={index} className="p-3 rounded-lg border">
                      <p className="font-medium">{socio.nome_socio}</p>
                      <p className="text-sm text-muted-foreground">
                        {socio.qualificacao_socio} • {socio.faixa_etaria}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Entrada: {formatDate(socio.data_entrada_sociedade)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Última atualização: {formatDate(selectedEmpresa.last_api_sync)}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}