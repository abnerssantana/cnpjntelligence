const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { Client } = require('pg');
require('dotenv').config({ path: '../.env.local' });

// Configuração da conexão com o banco
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const client = new Client({
  connectionString: process.env.POSTGRES_URL
});

// Função para processar uma linha do CSV
function processCSVLine(line) {
  // Remove aspas e divide por ponto e vírgula
  const fields = line.split(';').map(field => 
    field.replace(/^"/, '').replace(/"$/, '').trim()
  );
  
  return {
    cnpj_basico: fields[0] || null,
    cnpj_ordem: fields[1] || null,
    cnpj_dv: fields[2] || null,
    identificador_matriz_filial: fields[3] ? parseInt(fields[3]) : null,
    nome_fantasia: fields[4] || null,
    situacao_cadastral: fields[5] ? parseInt(fields[5]) : null,
    data_situacao_cadastral: fields[6] ? formatDate(fields[6]) : null,
    motivo_situacao_cadastral: fields[7] ? parseInt(fields[7]) : null,
    nome_cidade_exterior: fields[8] || null,
    pais: fields[9] ? parseInt(fields[9]) : null,
    data_inicio_atividade: fields[10] ? formatDate(fields[10]) : null,
    cnae_fiscal_principal: fields[11] || null,
    cnae_fiscal_secundaria: fields[12] || null,
    tipo_logradouro: fields[13] || null,
    logradouro: fields[14] || null,
    numero: fields[15] || null,
    complemento: fields[16] || null,
    bairro: fields[17] || null,
    cep: fields[18] || null,
    uf: fields[19] || null,
    municipio: fields[20] ? parseInt(fields[20]) : null,
    ddd1: fields[21] || null,
    telefone1: fields[22] || null,
    ddd2: fields[23] || null,
    telefone2: fields[24] || null,
    ddd_fax: fields[25] || null,
    fax: fields[26] || null,
    correio_eletronico: fields[27] || null,
    situacao_especial: fields[28] || null,
    data_situacao_especial: fields[29] ? formatDate(fields[29]) : null
  };
}

// Função para formatar data do formato YYYYMMDD para YYYY-MM-DD
function formatDate(dateStr) {
  if (!dateStr || dateStr.length !== 8) return null;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}-${month}-${day}`;
}

// Função para inserir empresa (se não existir)
async function insertCompany(cnpj_basico) {
  const query = `
    INSERT INTO companies (cnpj_basico, razao_social, natureza_juridica, qualificacao_responsavel, capital_social, porte_empresa)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (cnpj_basico) DO NOTHING
  `;
  
  try {
    await client.query(query, [
      cnpj_basico,
      null, // razao_social - não disponível no base.csv
      null, // natureza_juridica - não disponível no base.csv
      null, // qualificacao_responsavel - não disponível no base.csv
      null, // capital_social - não disponível no base.csv
      null  // porte_empresa - não disponível no base.csv
    ]);
  } catch (error) {
    console.error(`Erro ao inserir empresa ${cnpj_basico}:`, error.message);
  }
}

// Função para inserir estabelecimento
async function insertEstablishment(data) {
  const query = `
    INSERT INTO establishments (
      cnpj_basico, cnpj_ordem, cnpj_dv, identificador_matriz_filial,
      nome_fantasia, situacao_cadastral, data_situacao_cadastral,
      motivo_situacao_cadastral, nome_cidade_exterior, pais,
      data_inicio_atividade, cnae_fiscal_principal, cnae_fiscal_secundaria,
      tipo_logradouro, logradouro, numero, complemento, bairro,
      cep, uf, municipio, ddd1, telefone1, ddd2, telefone2,
      ddd_fax, fax, correio_eletronico, situacao_especial, data_situacao_especial
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
      $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
      $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
    )
  `;

  try {
    await client.query(query, [
      data.cnpj_basico, data.cnpj_ordem, data.cnpj_dv, data.identificador_matriz_filial,
      data.nome_fantasia, data.situacao_cadastral, data.data_situacao_cadastral,
      data.motivo_situacao_cadastral, data.nome_cidade_exterior, data.pais,
      data.data_inicio_atividade, data.cnae_fiscal_principal, data.cnae_fiscal_secundaria,
      data.tipo_logradouro, data.logradouro, data.numero, data.complemento, data.bairro,
      data.cep, data.uf, data.municipio, data.ddd1, data.telefone1, data.ddd2, data.telefone2,
      data.ddd_fax, data.fax, data.correio_eletronico, data.situacao_especial, data.data_situacao_especial
    ]);
    return true;
  } catch (error) {
    console.error(`✗ Erro ao inserir estabelecimento ${data.cnpj_basico}${data.cnpj_ordem}${data.cnpj_dv}:`, error.message);
    return false;
  }
}

// Função principal para teste
async function testImportStream() {
  const csvPath = path.join(__dirname, '..', 'CNPJ_Matrix', 'base.csv');
  
  try {
    console.log('Conectando ao banco de dados...');
    await client.connect();
    console.log('Conectado com sucesso!');

    const fileStream = fs.createReadStream(csvPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    let processedCount = 0;
    let errorCount = 0;
    const maxLines = 10; // Processar apenas 10 linhas para teste

    console.log(`Processando primeiras ${maxLines} linhas...`);

    for await (const line of rl) {
      if (lineCount >= maxLines) break;
      
      lineCount++;
      console.log(`\n--- Processando linha ${lineCount} ---`);
      
      if (!line.trim()) continue;
      
      const data = processCSVLine(line);
      console.log('Dados processados:', {
        cnpj_completo: `${data.cnpj_basico}${data.cnpj_ordem}${data.cnpj_dv}`,
        nome_fantasia: data.nome_fantasia || 'N/A',
        uf: data.uf,
        municipio: data.municipio,
        situacao_cadastral: data.situacao_cadastral
      });
      
      if (!data.cnpj_basico) {
        console.warn('Linha ignorada - CNPJ básico não encontrado');
        errorCount++;
        continue;
      }
      
      try {
        // Inserir empresa primeiro
        await insertCompany(data.cnpj_basico);
        console.log(`✓ Empresa processada: ${data.cnpj_basico}`);
        
        // Inserir estabelecimento
        const success = await insertEstablishment(data);
        if (success) {
          console.log(`✓ Estabelecimento inserido: ${data.cnpj_basico}${data.cnpj_ordem}${data.cnpj_dv}`);
          processedCount++;
        } else {
          errorCount++;
        }
      } catch (error) {
        console.error(`Erro na linha ${lineCount}:`, error.message);
        errorCount++;
      }
    }

    rl.close();
    
    // Verificar quantos registros foram inseridos
    const companiesCount = await client.query('SELECT COUNT(*) FROM companies');
    const establishmentsCount = await client.query('SELECT COUNT(*) FROM establishments');
    
    console.log('\n=== RESULTADO DO TESTE ===');
    console.log(`Linhas processadas: ${lineCount}`);
    console.log(`Sucessos: ${processedCount}`);
    console.log(`Erros: ${errorCount}`);
    console.log(`Empresas no banco: ${companiesCount.rows[0].count}`);
    console.log(`Estabelecimentos no banco: ${establishmentsCount.rows[0].count}`);
    
  } catch (error) {
    console.error('Erro geral:', error);
  } finally {
    await client.end();
    console.log('\nConexão encerrada.');
  }
}

testImportStream().catch(console.error);