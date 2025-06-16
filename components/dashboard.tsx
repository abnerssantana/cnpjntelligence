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
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Shield,
  Activity
} from 'lucide-react';
import { getEmpresaByCNPJ, searchEmpresas, getEmpresasStats } from '@/lib/api/cnpj';
import { formatCNPJ, formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

// Helper functions for status styling
const getStatusColor = (situacao: number) => {
  switch (situacao) {
    case 2: return 'text-green-600 bg-green-50 border-green-200';
    case 3: return 'text-red-600 bg-red-50 border-red-200';
    case 4: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 8: return 'text-gray-600 bg-gray-50 border-gray-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

const getStatusIcon = (situacao: number) => {
  switch (situacao) {
    case 2: return <CheckCircle className="h-4 w-4" />;
    case 3: return <XCircle className="h-4 w-4" />;
    case 4: return <AlertCircle className="h-4 w-4" />;
    case 8: return <Clock className="h-4 w-4" />;
    default: return <AlertCircle className="h-4 w-4" />;
  }
};

const getPorteColor = (porte: string) => {
  if (porte?.toLowerCase().includes('grande')) return 'text-purple-600 bg-purple-50 border-purple-200';
  if (porte?.toLowerCase().includes('médio')) return 'text-blue-600 bg-blue-50 border-blue-200';
  if (porte?.toLowerCase().includes('pequeno')) return 'text-green-600 bg-green-50 border-green-200';
  if (porte?.toLowerCase().includes('micro')) return 'text-orange-600 bg-orange-50 border-orange-200';
  return 'text-gray-600 bg-gray-50 border-gray-200';
};

export function Dash() {
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
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Total de Empresas</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Building2 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {loadingStats ? <Loader2 className="h-6 w-6 animate-spin text-blue-600" /> : stats.total.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Cadastradas no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Empresas Ativas</CardTitle>
            <div className="p-2 bg-green-50 rounded-lg">
              <Activity className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {loadingStats ? <Loader2 className="h-6 w-6 animate-spin text-green-600" /> : stats.ativas.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Situação cadastral ativa
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Taxa de Atividade</CardTitle>
            <div className="p-2 bg-purple-50 rounded-lg">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              {loadingStats ? <Loader2 className="h-6 w-6 animate-spin text-purple-600" /> : 
                stats.total > 0 ? `${((stats.ativas / stats.total) * 100).toFixed(1)}%` : '0%'
              }
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Empresas ativas vs total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Última Atualização</CardTitle>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Calendar className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-700">
              {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Dados sincronizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search Section */}
      <Card className="shadow-sm border-0 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Search className="h-5 w-5 text-blue-600" />
            Buscar Empresa
          </CardTitle>
          <CardDescription className="text-gray-600">
            Digite o CNPJ ou razão social da empresa - Ex. 06.990.590/0001-23
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="CNPJ ou Razão Social..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {empresas.length > 0 && !selectedEmpresa && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Building2 className="h-5 w-5 text-blue-600" />
              Resultados da Busca
            </CardTitle>
            <CardDescription className="text-gray-600">
              {empresas.length} empresa{empresas.length > 1 ? 's' : ''} encontrada{empresas.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {empresas.map((empresa) => (
                <div
                  key={empresa.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all duration-200"
                  onClick={() => setSelectedEmpresa(empresa)}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{empresa.razao_social}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      CNPJ: {formatCNPJ(empresa.cnpj)} • {empresa.municipio}/{empresa.uf}
                    </p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(empresa.situacao_cadastral)}`}>
                    {getStatusIcon(empresa.situacao_cadastral)}
                    {empresa.descricao_situacao_cadastral}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Company Details */}
      {selectedEmpresa && (
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl text-gray-900 mb-2">{selectedEmpresa.razao_social}</CardTitle>
                {selectedEmpresa.nome_fantasia && (
                  <CardDescription className="text-lg text-gray-700 font-medium">
                    {selectedEmpresa.nome_fantasia}
                  </CardDescription>
                )}
              </div>
              <div className="flex gap-3 items-start">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${getStatusColor(selectedEmpresa.situacao_cadastral)}`}>
                  {getStatusIcon(selectedEmpresa.situacao_cadastral)}
                  {selectedEmpresa.descricao_situacao_cadastral}
                </div>
                {empresas.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEmpresa(null)}
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Ver Lista
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-8 p-6">
            {/* Basic Info */}
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">CNPJ</p>
                  <p className="font-semibold text-gray-900 text-lg">{formatCNPJ(selectedEmpresa.cnpj)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Natureza Jurídica</p>
                  <p className="font-semibold text-gray-900">{selectedEmpresa.natureza_juridica}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Capital Social</p>
                  <p className="font-semibold text-gray-900 text-lg">{formatCurrency(selectedEmpresa.capital_social)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Porte</p>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${getPorteColor(selectedEmpresa.porte)}`}>
                    <Shield className="h-4 w-4 mr-1" />
                    {selectedEmpresa.porte}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Início das Atividades</p>
                  <p className="font-semibold text-gray-900">{formatDate(selectedEmpresa.data_inicio_atividade)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Situação Cadastral</p>
                  <p className="font-semibold text-gray-900">
                    {selectedEmpresa.descricao_situacao_cadastral} desde {formatDate(selectedEmpresa.data_situacao_cadastral)}
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                <div className="p-2 bg-green-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600" />
                </div>
                Endereço
              </h3>
              <div className="space-y-3">
                <p className="text-gray-900 font-medium text-lg">
                  {selectedEmpresa.logradouro}, {selectedEmpresa.numero}
                  {selectedEmpresa.complemento && ` - ${selectedEmpresa.complemento}`}
                </p>
                <p className="text-gray-700 font-medium">{selectedEmpresa.bairro}</p>
                <p className="text-gray-700 font-medium">
                  {selectedEmpresa.municipio} - {selectedEmpresa.uf} - CEP: {selectedEmpresa.cep}
                </p>
                {selectedEmpresa.email && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</p>
                    <p className="text-blue-600 font-medium">{selectedEmpresa.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Main Activity */}
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                Atividade Principal
              </h3>
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                <p className="font-bold text-purple-900 text-lg mb-2">{selectedEmpresa.cnae_fiscal}</p>
                <p className="text-gray-700 font-medium leading-relaxed">
                  {selectedEmpresa.cnae_fiscal_descricao}
                </p>
              </div>
            </div>

            {/* Partners */}
            {selectedEmpresa.empresa_socios && selectedEmpresa.empresa_socios.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-100 p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                  Quadro Societário
                </h3>
                <div className="space-y-4">
                  {selectedEmpresa.empresa_socios.map((socio: any, index: number) => (
                    <div key={index} className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200">
                      <p className="font-bold text-gray-900 text-lg mb-2">{socio.nome_socio}</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-500">Qualificação:</span>
                          <span className="text-gray-700 font-medium">{socio.qualificacao_socio}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-500">Faixa Etária:</span>
                          <span className="text-gray-700 font-medium">{socio.faixa_etaria}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-gray-500">Entrada:</span>
                          <span className="text-gray-700 font-medium">{formatDate(socio.data_entrada_sociedade)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <p className="text-sm font-medium text-gray-600">
                  Última atualização: <span className="text-gray-800">{formatDate(selectedEmpresa.last_api_sync)}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}