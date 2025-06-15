const { Client } = require('pg');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Configuração da conexão com o banco
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const client = new Client({
  connectionString: process.env.POSTGRES_URL
});

const API_BASE_URL = 'https://minhareceita.org';

/**
 * Import a company from the API by CNPJ
 */
async function importCompany(cnpj) {
  try {
    // Connect to database
    await client.connect();
    
    // Clean CNPJ (remove non-numeric characters)
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    // Format CNPJ for API (XX.XXX.XXX/XXXX-XX)
    const formattedCnpj = cleanCnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    
    console.log(`Fetching data for CNPJ: ${formattedCnpj}`);
    
    // Fetch from API
    const response = await axios.get(`${API_BASE_URL}/${formattedCnpj}`);
    const apiData = response.data;
    
    console.log('API Response received:', apiData.cnpj ? 'Valid CNPJ' : 'Invalid response');
    
    if (!apiData || !apiData.cnpj) {
      console.error('Invalid API response:', apiData);
      return false;
    }
    
    // Start transaction
    await client.query('BEGIN');
    
    try {
      // Upsert empresa
      const upsertQuery = `
        INSERT INTO empresas (
          cnpj, razao_social, nome_fantasia, logradouro, numero, complemento,
          bairro, municipio, uf, cep, email, porte, natureza_juridica,
          capital_social, cnae_fiscal, cnae_fiscal_descricao, situacao_cadastral,
          descricao_situacao_cadastral, data_situacao_cadastral, data_inicio_atividade,
          last_api_sync
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21
        )
        ON CONFLICT (cnpj) DO UPDATE SET
          razao_social = EXCLUDED.razao_social,
          nome_fantasia = EXCLUDED.nome_fantasia,
          logradouro = EXCLUDED.logradouro,
          numero = EXCLUDED.numero,
          complemento = EXCLUDED.complemento,
          bairro = EXCLUDED.bairro,
          municipio = EXCLUDED.municipio,
          uf = EXCLUDED.uf,
          cep = EXCLUDED.cep,
          email = EXCLUDED.email,
          porte = EXCLUDED.porte,
          natureza_juridica = EXCLUDED.natureza_juridica,
          capital_social = EXCLUDED.capital_social,
          cnae_fiscal = EXCLUDED.cnae_fiscal,
          cnae_fiscal_descricao = EXCLUDED.cnae_fiscal_descricao,
          situacao_cadastral = EXCLUDED.situacao_cadastral,
          descricao_situacao_cadastral = EXCLUDED.descricao_situacao_cadastral,
          data_situacao_cadastral = EXCLUDED.data_situacao_cadastral,
          data_inicio_atividade = EXCLUDED.data_inicio_atividade,
          last_api_sync = EXCLUDED.last_api_sync
        RETURNING id
      `;
      
      const empresaResult = await client.query(upsertQuery, [
        cleanCnpj,
        apiData.razao_social,
        apiData.nome_fantasia || '',
        apiData.logradouro || '',
        apiData.numero || '',
        apiData.complemento || '',
        apiData.bairro || '',
        apiData.municipio || '',
        apiData.uf || '',
        apiData.cep || '',
        apiData.email,
        apiData.porte || '',
        apiData.natureza_juridica || '',
        apiData.capital_social || 0,
        apiData.cnae_fiscal || 0,
        apiData.cnae_fiscal_descricao || '',
        apiData.situacao_cadastral || 0,
        apiData.descricao_situacao_cadastral || '',
        apiData.data_situacao_cadastral || null,
        apiData.data_inicio_atividade || null,
        new Date().toISOString()
      ]);
      
      const empresaId = empresaResult.rows[0].id;
      
      // Delete existing socios and cnaes_secundarios
      await client.query('DELETE FROM empresa_socios WHERE empresa_id = $1', [empresaId]);
      await client.query('DELETE FROM empresa_cnaes_secundarios WHERE empresa_id = $1', [empresaId]);
      
      // Insert socios if available
      if (apiData.qsa && apiData.qsa.length > 0) {
        for (const socio of apiData.qsa) {
          await client.query(`
            INSERT INTO empresa_socios (
              empresa_id, nome_socio, cnpj_cpf_do_socio, qualificacao_socio,
              data_entrada_sociedade, faixa_etaria
            ) VALUES ($1, $2, $3, $4, $5, $6)
          `, [
            empresaId,
            socio.nome_socio,
            socio.cnpj_cpf_do_socio || '',
            socio.qualificacao_socio || '',
            socio.data_entrada_sociedade || null,
            socio.faixa_etaria || ''
          ]);
        }
      }
      
      // Insert CNAEs secundarios if available
      if (apiData.cnaes_secundarios && apiData.cnaes_secundarios.length > 0) {
        for (const cnae of apiData.cnaes_secundarios) {
          await client.query(`
            INSERT INTO empresa_cnaes_secundarios (
              empresa_id, codigo, descricao
            ) VALUES ($1, $2, $3)
          `, [
            empresaId,
            cnae.codigo,
            cnae.descricao
          ]);
        }
      }
      
      await client.query('COMMIT');
      console.log(`Successfully imported company: ${cleanCnpj}`);
      return true;
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.error('CNPJ not found in API');
      } else if (error.response?.status === 429) {
        console.error('API rate limit exceeded');
      } else {
        console.error('API error:', error.response?.status, error.response?.data);
      }
    } else {
      console.error('Error importing company:', error);
    }
    return false;
  } finally {
    await client.end();
  }
}

/**
 * Import multiple companies from a list of CNPJs
 */
async function importCompanies(cnpjs) {
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  for (const cnpj of cnpjs) {
    try {
      const success = await importCompany(cnpj);
      if (success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push(`Failed to import ${cnpj}`);
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      results.failed++;
      results.errors.push(`Error importing ${cnpj}: ${error}`);
    }
  }
  
  return results;
}

module.exports = { importCompany, importCompanies };