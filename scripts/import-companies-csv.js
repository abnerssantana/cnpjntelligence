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

// Função para converter string para decimal de forma segura
function safeParseDecimal(value) {
  if (!value || value.trim() === '' || value === '""') {
    return null;
  }
  const parsed = parseFloat(value.trim().replace(',', '.'));
  return isNaN(parsed) ? null : parsed;
}

// Função para limpar e validar string
function cleanString(value) {
  if (!value || value.trim() === '' || value === '""') {
    return null;
  }
  return value.trim();
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

// Função para processar linha do CSV de empresas
// Formato esperado: cnpj_basico;razao_social;natureza_juridica;qualificacao_responsavel;capital_social;porte_empresa;ente_federativo_responsavel
function processCompanyCSVLine(line) {
  const fields = line.split(';').map(field => 
    field.replace(/^"/, '').replace(/"$/, '').trim()
  );
  
  return {
    cnpj_basico: cleanString(fields[0]),
    razao_social: cleanString(fields[1]),
    natureza_juridica: safeParseInt(fields[2]),
    qualificacao_responsavel: safeParseInt(fields[3]),
    capital_social: safeParseDecimal(fields[4]),
    porte_empresa: safeParseInt(fields[5]),
    ente_federativo_responsavel: cleanString(fields[6])
  };
}

// Função para processar linha do CSV de sócios
// Formato esperado: cnpj_basico;identificador_socio;nome_socio;cnpj_cpf_socio;qualificacao_socio;data_entrada_sociedade;pais;representante_legal;nome_representante;qualificacao_representante;faixa_etaria
function processPartnerCSVLine(line) {
  const fields = line.split(';').map(field => 
    field.replace(/^"/, '').replace(/"$/, '').trim()
  );
  
  return {
    cnpj_basico: cleanString(fields[0]),
    identificador_socio: safeParseInt(fields[1]),
    nome_socio: cleanString(fields[2]),
    cnpj_cpf_socio: cleanString(fields[3]),
    qualificacao_socio: safeParseInt(fields[4]),
    data_entrada_sociedade: formatDate(fields[5]),
    pais: safeParseInt(fields[6]),
    representante_legal: cleanString(fields[7]),
    nome_representante: cleanString(fields[8]),
    qualificacao_representante: safeParseInt(fields[9]),
    faixa_etaria: safeParseInt(fields[10])
  };
}

// Função para processar linha do CSV de simples
// Formato esperado: cnpj_basico;opcao_pelo_simples;data_opcao_simples;data_exclusao_simples;opcao_pelo_mei;data_opcao_mei;data_exclusao_mei
function processSimplesCSVLine(line) {
  const fields = line.split(';').map(field => 
    field.replace(/^"/, '').replace(/"$/, '').trim()
  );
  
  return {
    cnpj_basico: cleanString(fields[0]),
    opcao_pelo_simples: cleanString(fields[1]),
    data_opcao_simples: formatDate(fields[2]),
    data_exclusao_simples: formatDate(fields[3]),
    opcao_pelo_mei: cleanString(fields[4]),
    data_opcao_mei: formatDate(fields[5]),
    data_exclusao_mei: formatDate(fields[6])
  };
}

// Função para validar CNPJ básico
function validateCNPJBasico(cnpj_basico) {
  return cnpj_basico && cnpj_basico.length === 8 && /^\d{8}$/.test(cnpj_basico);
}

// Função para inserir/atualizar empresa
async function upsertCompany(data) {
  const query = `
    INSERT INTO companies (
      cnpj_basico, razao_social, natureza_juridica, 
      qualificacao_responsavel, capital_social, porte_empresa, 
      ente_federativo_responsavel
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (cnpj_basico) 
    DO UPDATE SET
      razao_social = EXCLUDED.razao_social,
      natureza_juridica = EXCLUDED.natureza_juridica,
      qualificacao_responsavel = EXCLUDED.qualificacao_responsavel,
      capital_social = EXCLUDED.capital_social,
      porte_empresa = EXCLUDED.porte_empresa,
      ente_federativo_responsavel = EXCLUDED.ente_federativo_responsavel
  `;

  try {
    await client.query(query, [
      data.cnpj_basico,
      data.razao_social,
      data.natureza_juridica,
      data.qualificacao_responsavel,
      data.capital_social,
      data.porte_empresa,
      data.ente_federativo_responsavel
    ]);
    return true;
  } catch (error) {
    console.error(`Erro ao inserir empresa ${data.cnpj_basico}:`, error.message);
    throw error;
  }
}

// Função para inserir sócio
async function insertPartner(data) {
  const query = `
    INSERT INTO partners (
      cnpj_basico, identificador_socio, nome_socio, cnpj_cpf_socio,
      qualificacao_socio, data_entrada_sociedade, pais,
      representante_legal, nome_representante, qualificacao_representante, faixa_etaria
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT DO NOTHING
  `;

  try {
    await client.query(query, [
      data.cnpj_basico,
      data.identificador_socio,
      data.nome_socio,
      data.cnpj_cpf_socio,
      data.qualificacao_socio,
      data.data_entrada_sociedade,
      data.pais,
      data.representante_legal,
      data.nome_representante,
      data.qualificacao_representante,
      data.faixa_etaria
    ]);
    return true;
  } catch (error) {
    console.error(`Erro ao inserir sócio ${data.cnpj_basico}:`, error.message);
    throw error;
  }
}

// Função para inserir dados do simples
async function upsertSimples(data) {
  const query = `
    INSERT INTO simples_data (
      cnpj_basico, opcao_pelo_simples, data_opcao_simples,
      data_exclusao_simples, opcao_pelo_mei, data_opcao_mei, data_exclusao_mei
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (cnpj_basico) 
    DO UPDATE SET
      opcao_pelo_simples = EXCLUDED.opcao_pelo_simples,
      data_opcao_simples = EXCLUDED.data_opcao_simples,
      data_exclusao_simples = EXCLUDED.data_exclusao_simples,
      opcao_pelo_mei = EXCLUDED.opcao_pelo_mei,
      data_opcao_mei = EXCLUDED.data_opcao_mei,
      data_exclusao_mei = EXCLUDED.data_exclusao_mei
  `;

  try {
    await client.query(query, [
      data.cnpj_basico,
      data.opcao_pelo_simples,
      data.data_opcao_simples,
      data.data_exclusao_simples,
      data.opcao_pelo_mei,
      data.data_opcao_mei,
      data.data_exclusao_mei
    ]);
    return true;
  } catch (error) {
    console.error(`Erro ao inserir simples ${data.cnpj_basico}:`, error.message);
    throw error;
  }
}

// Função genérica para processar lote
async function processBatch(batch, processFunction, tableName) {
  await client.query('BEGIN');
  
  try {
    let successCount = 0;
    let errorCount = 0;
    
    for (const data of batch) {
      if (!validateCNPJBasico(data.cnpj_basico)) {
        console.warn(`CNPJ básico inválido ignorado: ${data.cnpj_basico}`);
        errorCount++;
        continue;
      }
      
      try {
        await processFunction(data);
        successCount++;
      } catch (error) {
        console.error(`Erro ao processar ${tableName} ${data.cnpj_basico}:`, error.message);
        errorCount++;
      }
    }
    
    await client.query('COMMIT');
    return { success: successCount, errors: errorCount };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`Erro no lote de ${tableName}, transação revertida:`, error.message);
    return { success: 0, errors: batch.length };
  }
}

// Função genérica para importar CSV
async function importCSVFile(fileName, processLineFunction, processBatchFunction, tableName) {
  const csvPath = path.join(__dirname, '..', 'CNPJ_Matrix', fileName);
  
  // Verificar se o arquivo existe
  if (!fs.existsSync(csvPath)) {
    console.log(`⚠️ Arquivo ${fileName} não encontrado. Pulando...`);
    return { processed: 0, success: 0, errors: 0 };
  }
  
  console.log(`📊 Importando ${tableName} do arquivo ${fileName}...`);
  
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  let totalSuccess = 0;
  let totalErrors = 0;
  let batch = [];
  const batchSize = 1000;
  const reportInterval = 10000;
  
  const startTime = Date.now();

  for await (const line of rl) {
    if (!line.trim()) continue;
    
    lineCount++;
    
    try {
      const data = processLineFunction(line);
      
      if (data.cnpj_basico) {
        batch.push(data);
      }
      
      // Processar lote quando atingir o tamanho desejado
      if (batch.length >= batchSize) {
        const result = await processBatch(batch, processBatchFunction, tableName);
        totalSuccess += result.success;
        totalErrors += result.errors;
        batch = [];
        
        // Relatório de progresso
        if (lineCount % reportInterval === 0) {
          const elapsed = (Date.now() - startTime) / 1000;
          const rate = lineCount / elapsed;
          console.log(`📈 ${tableName}: ${lineCount.toLocaleString()} linhas | ${totalSuccess.toLocaleString()} sucessos | ${totalErrors.toLocaleString()} erros | ${rate.toFixed(0)} linhas/seg`);
        }
      }
    } catch (error) {
      console.error(`Erro na linha ${lineCount} de ${fileName}:`, error.message);
      totalErrors++;
    }
  }
  
  // Processar último lote se houver dados restantes
  if (batch.length > 0) {
    const result = await processBatch(batch, processBatchFunction, tableName);
    totalSuccess += result.success;
    totalErrors += result.errors;
  }

  rl.close();
  
  const endTime = Date.now();
  const totalTime = (endTime - startTime) / 1000;
  
  console.log(`✅ ${tableName} - Processadas: ${lineCount.toLocaleString()} | Sucessos: ${totalSuccess.toLocaleString()} | Erros: ${totalErrors.toLocaleString()} | Tempo: ${Math.floor(totalTime / 60)}m ${Math.floor(totalTime % 60)}s`);
  
  return { processed: lineCount, success: totalSuccess, errors: totalErrors };
}

// Função principal
async function importAllCSVFiles() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    const startTime = Date.now();
    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalErrors = 0;
    
    // Importar empresas
    const companiesResult = await importCSVFile(
      'empresas.csv', 
      processCompanyCSVLine, 
      upsertCompany, 
      'Empresas'
    );
    totalProcessed += companiesResult.processed;
    totalSuccess += companiesResult.success;
    totalErrors += companiesResult.errors;
    
    // Importar sócios
    const partnersResult = await importCSVFile(
      'socios.csv', 
      processPartnerCSVLine, 
      insertPartner, 
      'Sócios'
    );
    totalProcessed += partnersResult.processed;
    totalSuccess += partnersResult.success;
    totalErrors += partnersResult.errors;
    
    // Importar simples
    const simplesResult = await importCSVFile(
      'simples.csv', 
      processSimplesCSVLine, 
      upsertSimples, 
      'Simples'
    );
    totalProcessed += simplesResult.processed;
    totalSuccess += simplesResult.success;
    totalErrors += simplesResult.errors;
    
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    // Verificar quantos registros foram inseridos
    const companiesCount = await client.query('SELECT COUNT(*) FROM companies WHERE razao_social IS NOT NULL');
    const partnersCount = await client.query('SELECT COUNT(*) FROM partners');
    const simplesCount = await client.query('SELECT COUNT(*) FROM simples_data');
    
    console.log('\n🎉 === IMPORTAÇÃO DE DADOS COMPLEMENTARES CONCLUÍDA ===');
    console.log(`📋 Total de linhas processadas: ${totalProcessed.toLocaleString()}`);
    console.log(`✅ Total de sucessos: ${totalSuccess.toLocaleString()}`);
    console.log(`❌ Total de erros: ${totalErrors.toLocaleString()}`);
    console.log(`📊 Taxa de sucesso: ${((totalSuccess / (totalSuccess + totalErrors)) * 100).toFixed(2)}%`);
    console.log(`🏢 Empresas com dados completos: ${companiesCount.rows[0].count}`);
    console.log(`👥 Sócios no banco: ${partnersCount.rows[0].count}`);
    console.log(`📋 Registros Simples: ${simplesCount.rows[0].count}`);
    console.log(`⏱️ Tempo total: ${Math.floor(totalTime / 60)}m ${Math.floor(totalTime % 60)}s`);
    console.log(`🚀 Velocidade média: ${(totalProcessed / totalTime).toFixed(0)} linhas/segundo`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await client.end();
    console.log('🔌 Conexão com banco encerrada.');
  }
}

// Executar o script
if (require.main === module) {
  console.log('🚀 Iniciando importação de dados complementares (empresas, sócios, simples)...');
  importAllCSVFiles().catch(console.error);
}

module.exports = { 
  importAllCSVFiles,
  importCSVFile,
  processCompanyCSVLine,
  processPartnerCSVLine,
  processSimplesCSVLine
};