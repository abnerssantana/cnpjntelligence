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

// Função para converter string para integer de forma segura
function safeParseInt(value) {
  if (!value || value.trim() === '' || value === '""') {
    return null;
  }
  const parsed = parseInt(value.trim());
  return isNaN(parsed) ? null : parsed;
}

// Função para limpar e validar string
function cleanString(value) {
  if (!value || value.trim() === '' || value === '""') {
    return null;
  }
  return value.trim();
}

// Função para processar uma linha do CSV
function processCSVLine(line) {
  // Remove aspas e divide por ponto e vírgula
  const fields = line.split(';').map(field => 
    field.replace(/^"/, '').replace(/"$/, '').trim()
  );
  
  return {
    cnpj_basico: cleanString(fields[0]),
    cnpj_ordem: cleanString(fields[1]),
    cnpj_dv: cleanString(fields[2]),
    identificador_matriz_filial: safeParseInt(fields[3]),
    nome_fantasia: cleanString(fields[4]),
    situacao_cadastral: safeParseInt(fields[5]),
    data_situacao_cadastral: formatDate(fields[6]),
    motivo_situacao_cadastral: safeParseInt(fields[7]),
    nome_cidade_exterior: cleanString(fields[8]),
    pais: safeParseInt(fields[9]),
    data_inicio_atividade: formatDate(fields[10]),
    cnae_fiscal_principal: cleanString(fields[11]),
    cnae_fiscal_secundaria: cleanString(fields[12]),
    tipo_logradouro: cleanString(fields[13]),
    logradouro: cleanString(fields[14]),
    numero: cleanString(fields[15]),
    complemento: cleanString(fields[16]),
    bairro: cleanString(fields[17]),
    cep: cleanString(fields[18]),
    uf: cleanString(fields[19]),
    municipio: safeParseInt(fields[20]),
    ddd1: cleanString(fields[21]),
    telefone1: cleanString(fields[22]),
    ddd2: cleanString(fields[23]),
    telefone2: cleanString(fields[24]),
    ddd_fax: cleanString(fields[25]),
    fax: cleanString(fields[26]),
    correio_eletronico: cleanString(fields[27]),
    situacao_especial: cleanString(fields[28]),
    data_situacao_especial: formatDate(fields[29])
  };
}

// Função para formatar data do formato YYYYMMDD para YYYY-MM-DD
function formatDate(dateStr) {
  if (!dateStr || dateStr.trim() === '' || dateStr.length !== 8) {
    return null;
  }
  
  const cleanDate = dateStr.trim();
  if (!/^\d{8}$/.test(cleanDate)) {
    return null;
  }
  
  const year = cleanDate.substring(0, 4);
  const month = cleanDate.substring(4, 6);
  const day = cleanDate.substring(6, 8);
  
  // Validação básica de data
  if (year < '1900' || month < '01' || month > '12' || day < '01' || day > '31') {
    return null;
  }
  
  return `${year}-${month}-${day}`;
}

// Função para criar constraint única se não existir
async function ensureUniqueConstraint() {
  try {
    console.log('🔧 Verificando constraint única para establishments...');
    
    // Verificar se a constraint já existe
    const constraintCheck = await client.query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'establishments' 
      AND constraint_type = 'UNIQUE'
      AND constraint_name = 'establishments_cnpj_unique'
    `);
    
    if (constraintCheck.rows.length === 0) {
      console.log('➕ Adicionando constraint única para CNPJ completo...');
      await client.query(`
        ALTER TABLE establishments 
        ADD CONSTRAINT establishments_cnpj_unique 
        UNIQUE (cnpj_basico, cnpj_ordem, cnpj_dv)
      `);
      console.log('✅ Constraint única adicionada com sucesso!');
    } else {
      console.log('✅ Constraint única já existe!');
    }
  } catch (error) {
    console.error('⚠️ Erro ao criar constraint (pode ser normal se já existir):', error.message);
  }
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
    throw error;
  }
}

// Função para inserir estabelecimento com proteção melhorada contra duplicatas
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
    ON CONFLICT (cnpj_basico, cnpj_ordem, cnpj_dv) 
    DO UPDATE SET
      nome_fantasia = EXCLUDED.nome_fantasia,
      situacao_cadastral = EXCLUDED.situacao_cadastral,
      data_situacao_cadastral = EXCLUDED.data_situacao_cadastral,
      motivo_situacao_cadastral = EXCLUDED.motivo_situacao_cadastral,
      nome_cidade_exterior = EXCLUDED.nome_cidade_exterior,
      pais = EXCLUDED.pais,
      data_inicio_atividade = EXCLUDED.data_inicio_atividade,
      cnae_fiscal_principal = EXCLUDED.cnae_fiscal_principal,
      cnae_fiscal_secundaria = EXCLUDED.cnae_fiscal_secundaria,
      tipo_logradouro = EXCLUDED.tipo_logradouro,
      logradouro = EXCLUDED.logradouro,
      numero = EXCLUDED.numero,
      complemento = EXCLUDED.complemento,
      bairro = EXCLUDED.bairro,
      cep = EXCLUDED.cep,
      uf = EXCLUDED.uf,
      municipio = EXCLUDED.municipio,
      ddd1 = EXCLUDED.ddd1,
      telefone1 = EXCLUDED.telefone1,
      ddd2 = EXCLUDED.ddd2,
      telefone2 = EXCLUDED.telefone2,
      ddd_fax = EXCLUDED.ddd_fax,
      fax = EXCLUDED.fax,
      correio_eletronico = EXCLUDED.correio_eletronico,
      situacao_especial = EXCLUDED.situacao_especial,
      data_situacao_especial = EXCLUDED.data_situacao_especial
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
    console.error(`Erro ao inserir estabelecimento ${data.cnpj_basico}${data.cnpj_ordem}${data.cnpj_dv}:`, error.message);
    console.error('Dados problemáticos:', {
      cnpj: `${data.cnpj_basico}${data.cnpj_ordem}${data.cnpj_dv}`,
      identificador_matriz_filial: data.identificador_matriz_filial,
      situacao_cadastral: data.situacao_cadastral,
      motivo_situacao_cadastral: data.motivo_situacao_cadastral,
      pais: data.pais,
      municipio: data.municipio
    });
    throw error;
  }
}

// Função para validar dados antes de processar
function validateData(data) {
  const errors = [];
  
  if (!data.cnpj_basico || data.cnpj_basico.length !== 8) {
    errors.push('CNPJ básico inválido');
  }
  
  if (!data.cnpj_ordem || data.cnpj_ordem.length !== 4) {
    errors.push('CNPJ ordem inválido');
  }
  
  if (!data.cnpj_dv || data.cnpj_dv.length !== 2) {
    errors.push('CNPJ DV inválido');
  }
  
  return errors;
}

// Função para processar um lote de dados
async function processBatch(batch) {
  await client.query('BEGIN');
  
  try {
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const data of batch) {
      // Validar dados
      const validationErrors = validateData(data);
      if (validationErrors.length > 0) {
        console.warn(`Linha ignorada - ${validationErrors.join(', ')}: ${data.cnpj_basico}${data.cnpj_ordem}${data.cnpj_dv}`);
        skippedCount++;
        continue;
      }
      
      await insertCompany(data.cnpj_basico);
      
      // Verificar se o estabelecimento já existe
      const existsQuery = `
        SELECT id FROM establishments 
        WHERE cnpj_basico = $1 AND cnpj_ordem = $2 AND cnpj_dv = $3
      `;
      const existsResult = await client.query(existsQuery, [
        data.cnpj_basico, data.cnpj_ordem, data.cnpj_dv
      ]);
      
      if (existsResult.rows.length > 0) {
        updatedCount++;
      } else {
        insertedCount++;
      }
      
      await insertEstablishment(data);
    }
    
    await client.query('COMMIT');
    return { 
      success: batch.length - skippedCount, 
      errors: 0, 
      inserted: insertedCount, 
      updated: updatedCount,
      skipped: skippedCount
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erro no lote, transação revertida:', error.message);
    return { 
      success: 0, 
      errors: batch.length, 
      inserted: 0, 
      updated: 0,
      skipped: 0
    };
  }
}

// Função principal
async function importCSV() {
  const csvPath = path.join(__dirname, '..', 'CNPJ_Matrix', 'base.csv');
  
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    // Garantir que a constraint única existe
    await ensureUniqueConstraint();

    const fileStream = fs.createReadStream(csvPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    let processedCount = 0;
    let errorCount = 0;
    let insertedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let batch = [];
    const batchSize = 1000;
    const reportInterval = 10000;

    console.log('📊 Iniciando importação do arquivo base.csv...');
    console.log(`📦 Processando em lotes de ${batchSize} registros`);
    console.log('🛡️ Proteção contra duplicatas: ATIVA');
    console.log('🔧 Validação de dados: ATIVA');
    
    const startTime = Date.now();

    for await (const line of rl) {
      if (!line.trim()) continue;
      
      lineCount++;
      
      try {
        const data = processCSVLine(line);
        
        if (data.cnpj_basico) {
          batch.push(data);
        } else {
          skippedCount++;
        }
        
        // Processar lote quando atingir o tamanho desejado
        if (batch.length >= batchSize) {
          const result = await processBatch(batch);
          processedCount += result.success;
          errorCount += result.errors;
          insertedCount += result.inserted;
          updatedCount += result.updated;
          skippedCount += result.skipped;
          batch = [];
          
          // Relatório de progresso
          if (lineCount % reportInterval === 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            const rate = lineCount / elapsed;
            console.log(`📈 Progresso: ${lineCount.toLocaleString()} linhas | ${processedCount.toLocaleString()} processados | ${insertedCount.toLocaleString()} novos | ${updatedCount.toLocaleString()} atualizados | ${skippedCount.toLocaleString()} ignorados | ${rate.toFixed(0)} linhas/seg`);
          }
        }
      } catch (error) {
        console.error(`Erro na linha ${lineCount}:`, error.message);
        errorCount++;
      }
    }
    
    // Processar último lote se houver dados restantes
    if (batch.length > 0) {
      const result = await processBatch(batch);
      processedCount += result.success;
      errorCount += result.errors;
      insertedCount += result.inserted;
      updatedCount += result.updated;
      skippedCount += result.skipped;
    }

    rl.close();
    
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    // Verificar quantos registros foram inseridos
    const companiesCount = await client.query('SELECT COUNT(*) FROM companies');
    const establishmentsCount = await client.query('SELECT COUNT(*) FROM establishments');
    
    console.log('\n🎉 === IMPORTAÇÃO CONCLUÍDA ===');
    console.log(`📋 Total de linhas processadas: ${lineCount.toLocaleString()}`);
    console.log(`✅ Registros processados com sucesso: ${processedCount.toLocaleString()}`);
    console.log(`🆕 Novos estabelecimentos inseridos: ${insertedCount.toLocaleString()}`);
    console.log(`🔄 Estabelecimentos atualizados: ${updatedCount.toLocaleString()}`);
    console.log(`⚠️ Linhas ignoradas (dados inválidos): ${skippedCount.toLocaleString()}`);
    console.log(`❌ Erros encontrados: ${errorCount.toLocaleString()}`);
    console.log(`📊 Taxa de sucesso: ${((processedCount / (processedCount + errorCount + skippedCount)) * 100).toFixed(2)}%`);
    console.log(`🏢 Empresas no banco: ${companiesCount.rows[0].count}`);
    console.log(`🏪 Estabelecimentos no banco: ${establishmentsCount.rows[0].count}`);
    console.log(`⏱️  Tempo total: ${Math.floor(totalTime / 60)}m ${Math.floor(totalTime % 60)}s`);
    console.log(`🚀 Velocidade média: ${(lineCount / totalTime).toFixed(0)} linhas/segundo`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await client.end();
    console.log('🔌 Conexão com banco encerrada.');
  }
}

// Executar o script
if (require.main === module) {
  console.log('🚀 Iniciando script de importação CNPJ com validação robusta...');
  importCSV().catch(console.error);
}

module.exports = { importCSV };