import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-singleton';
import axios from 'axios';
import https from 'https';

const API_BASE_URL = 'https://minhareceita.org';

// Create axios instance with custom HTTPS agent to handle SSL issues
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false // This will accept self-signed certificates
  })
});

export async function POST(request: NextRequest) {
  try {
    const { cnpj } = await request.json();
    const supabaseAdmin = getSupabaseAdmin();
    
    if (!cnpj) {
      return NextResponse.json(
        { error: 'CNPJ is required' },
        { status: 400 }
      );
    }

    // Clean CNPJ (remove non-numeric characters)
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    // Format CNPJ for API (XX.XXX.XXX/XXXX-XX)
    const formattedCnpj = cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    
    // Fetch from API
    const response = await axiosInstance.get(`${API_BASE_URL}/${formattedCnpj}`);
    const apiData = response.data;
    
    if (!apiData || !apiData.cnpj) {
      return NextResponse.json(
        { error: 'Invalid API response' },
        { status: 400 }
      );
    }

    try {
      // Prepare empresa data
      const empresaData = {
        cnpj: cleanCnpj,
        razao_social: apiData.razao_social,
        nome_fantasia: apiData.nome_fantasia || '',
        logradouro: apiData.logradouro || '',
        numero: apiData.numero || '',
        complemento: apiData.complemento || '',
        bairro: apiData.bairro || '',
        municipio: apiData.municipio || '',
        uf: apiData.uf || '',
        cep: apiData.cep || '',
        email: apiData.email,
        porte: apiData.porte || '',
        natureza_juridica: apiData.natureza_juridica || '',
        capital_social: apiData.capital_social || 0,
        cnae_fiscal: apiData.cnae_fiscal || 0,
        cnae_fiscal_descricao: apiData.cnae_fiscal_descricao || '',
        situacao_cadastral: apiData.situacao_cadastral || 0,
        descricao_situacao_cadastral: apiData.descricao_situacao_cadastral || '',
        data_situacao_cadastral: apiData.data_situacao_cadastral || null,
        data_inicio_atividade: apiData.data_inicio_atividade || null,
        last_api_sync: new Date().toISOString()
      };

      // Upsert empresa using Supabase
      const { data: empresa, error: empresaError } = await supabaseAdmin
        .from('empresas')
        .upsert(empresaData, {
          onConflict: 'cnpj',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (empresaError) {
        throw empresaError;
      }

      const empresaId = empresa.id;
      
      // Delete existing socios and cnaes_secundarios
      await supabaseAdmin
        .from('empresa_socios')
        .delete()
        .eq('empresa_id', empresaId);
      
      await supabaseAdmin
        .from('empresa_cnaes_secundarios')
        .delete()
        .eq('empresa_id', empresaId);
      
      // Insert socios if available
      if (apiData.qsa && apiData.qsa.length > 0) {
        const sociosData = apiData.qsa.map((socio: any) => ({
          empresa_id: empresaId,
          nome_socio: socio.nome_socio,
          cnpj_cpf_do_socio: socio.cnpj_cpf_do_socio || '',
          qualificacao_socio: socio.qualificacao_socio || '',
          data_entrada_sociedade: socio.data_entrada_sociedade || null,
          faixa_etaria: socio.faixa_etaria || ''
        }));

        const { error: sociosError } = await supabaseAdmin
          .from('empresa_socios')
          .insert(sociosData);

        if (sociosError) {
          throw sociosError;
        }
      }
      
      // Insert CNAEs secundarios if available
      if (apiData.cnaes_secundarios && apiData.cnaes_secundarios.length > 0) {
        const cnaesData = apiData.cnaes_secundarios.map((cnae: any) => ({
          empresa_id: empresaId,
          codigo: cnae.codigo,
          descricao: cnae.descricao
        }));

        const { error: cnaesError } = await supabaseAdmin
          .from('empresa_cnaes_secundarios')
          .insert(cnaesData);

        if (cnaesError) {
          throw cnaesError;
        }
      }
      
      return NextResponse.json({ 
        success: true,
        empresaId,
        message: 'Company imported successfully'
      });
      
    } catch (error) {
      throw error;
    }
    
  } catch (error: any) {
    console.error('Error importing company:', error);
    
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        return NextResponse.json(
          { error: 'CNPJ not found in API' },
          { status: 404 }
        );
      } else if (error.response?.status === 429) {
        return NextResponse.json(
          { error: 'API rate limit exceeded' },
          { status: 429 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to import company', details: error.message },
      { status: 500 }
    );
  }
}