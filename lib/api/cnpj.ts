import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const API_BASE_URL = 'https://minhareceita.org';
const CACHE_DURATION_DAYS = 7; // Revalidate data after 7 days

export interface Empresa {
  id: number;
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  email: string | null;
  porte: string;
  natureza_juridica: string;
  capital_social: number;
  cnae_fiscal: number;
  cnae_fiscal_descricao: string;
  situacao_cadastral: number;
  descricao_situacao_cadastral: string;
  data_situacao_cadastral: string;
  data_inicio_atividade: string;
  last_api_sync: string;
  empresa_socios?: EmpresaSocio[];
  empresa_cnaes_secundarios?: EmpresaCnae[];
}

export interface EmpresaSocio {
  id: number;
  nome_socio: string;
  cnpj_cpf_do_socio: string;
  qualificacao_socio: string;
  data_entrada_sociedade: string;
  faixa_etaria: string;
}

export interface EmpresaCnae {
  id: number;
  codigo: number;
  descricao: string;
}

/**
 * Get company data by CNPJ
 * First checks local database, then fetches from API if needed
 */
export async function getEmpresaByCNPJ(cnpj: string): Promise<Empresa | null> {
  try {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    // Check local database first
    const { data: empresa, error } = await supabase
      .from('empresas')
      .select(`
        *,
        empresa_socios (*),
        empresa_cnaes_secundarios (*)
      `)
      .eq('cnpj', cleanCnpj)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    // Check if data needs refresh
    if (empresa) {
      const lastSync = new Date(empresa.last_api_sync);
      const daysSinceSync = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceSync < CACHE_DURATION_DAYS) {
        return empresa;
      }
    }

    // Fetch from API
    const freshData = await fetchFromAPI(cleanCnpj);
    if (freshData) {
      return freshData;
    }

    return empresa; // Return stale data if API fails
  } catch (error) {
    console.error('Error getting empresa:', error);
    return null;
  }
}

/**
 * Search companies by various criteria
 */
export async function searchEmpresas(params: {
  razao_social?: string;
  nome_fantasia?: string;
  uf?: string;
  municipio?: string;
  cnae_fiscal?: number;
  porte?: string;
  situacao_cadastral?: number;
  limit?: number;
  offset?: number;
}) {
  try {
    let query = supabase.from('empresas').select('*', { count: 'exact' });

    // Apply filters
    if (params.razao_social) {
      query = query.ilike('razao_social', `%${params.razao_social}%`);
    }
    if (params.nome_fantasia) {
      query = query.ilike('nome_fantasia', `%${params.nome_fantasia}%`);
    }
    if (params.uf) {
      query = query.eq('uf', params.uf);
    }
    if (params.municipio) {
      query = query.ilike('municipio', `%${params.municipio}%`);
    }
    if (params.cnae_fiscal) {
      query = query.eq('cnae_fiscal', params.cnae_fiscal);
    }
    if (params.porte) {
      query = query.eq('codigo_porte', params.porte);
    }
    if (params.situacao_cadastral !== undefined) {
      query = query.eq('situacao_cadastral', params.situacao_cadastral);
    }

    // Pagination
    const limit = params.limit || 20;
    const offset = params.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data,
      count,
      limit,
      offset
    };
  } catch (error) {
    console.error('Error searching empresas:', error);
    throw error;
  }
}

/**
 * Get companies by partner name
 */
export async function getEmpresasBySocio(nomeSocio: string) {
  try {
    const { data, error } = await supabase
      .from('empresa_socios')
      .select(`
        empresa_id,
        empresas (*)
      `)
      .ilike('nome_socio', `%${nomeSocio}%`);

    if (error) throw error;

    return data?.map(item => item.empresas).filter(Boolean);
  } catch (error) {
    console.error('Error getting empresas by socio:', error);
    throw error;
  }
}

/**
 * Get companies by secondary CNAE
 */
export async function getEmpresasByCnaeSecundario(codigoCnae: number) {
  try {
    const { data, error } = await supabase
      .from('empresa_cnaes_secundarios')
      .select(`
        empresa_id,
        empresas (*)
      `)
      .eq('codigo', codigoCnae);

    if (error) throw error;

    return data?.map(item => item.empresas).filter(Boolean);
  } catch (error) {
    console.error('Error getting empresas by CNAE secundario:', error);
    throw error;
  }
}

/**
 * Fetch fresh data from API and update database
 */
async function fetchFromAPI(cnpj: string): Promise<Empresa | null> {
  try {
    const formattedCnpj = cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    const response = await axios.get(`${API_BASE_URL}/${formattedCnpj}`);
    const apiData = response.data;

    // Import the data using the existing import logic
    const { importCompany } = await import('@/scripts/import-from-api');
    const success = await importCompany(cnpj);

    if (success) {
      // Fetch the updated data from database
      const { data } = await supabase
        .from('empresas')
        .select(`
          *,
          empresa_socios (*),
          empresa_cnaes_secundarios (*)
        `)
        .eq('cnpj', cnpj)
        .single();

      return data;
    }

    return null;
  } catch (error) {
    console.error('Error fetching from API:', error);
    return null;
  }
}

/**
 * Get statistics about companies in database
 */
export async function getEmpresasStats() {
  try {
    const { count: total } = await supabase
      .from('empresas')
      .select('*', { count: 'exact', head: true });

    const { count: ativas } = await supabase
      .from('empresas')
      .select('*', { count: 'exact', head: true })
      .eq('situacao_cadastral', 2);

    return {
      total: total || 0,
      ativas: ativas || 0
    };
  } catch (error) {
    console.error('Error getting stats:', error);
    return {
      total: 0,
      ativas: 0
    };
  }
}