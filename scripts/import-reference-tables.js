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

// Função para limpar e validar string
function cleanString(value) {
  if (!value || value.trim() === '' || value === '""') {
    return null;
  }
  return value.trim();
}

// Função para converter string para integer de forma segura
function safeParseInt(value) {
  if (!value || value.trim() === '' || value === '""') {
    return null;
  }
  const parsed = parseInt(value.trim());
  return isNaN(parsed) ? null : parsed;
}

// Função para processar linha de CSV de referência (formato: codigo;descricao)
function processReferenceCSVLine(line) {
  // Remove aspas e divide por ponto e vírgula
  const fields = line.split(';').map(field => 
    field.replace(/^"/, '').replace(/"$/, '').trim()
  );
  
  return {
    codigo: fields[0] ? (isNaN(parseInt(fields[0])) ? cleanString(fields[0]) : safeParseInt(fields[0])) : null,
    descricao: cleanString(fields[1])
  };
}

// Função para importar CNAEs
async function importCNAEs() {
  const csvPath = path.join(__dirname, '..', 'CNPJ_Matrix', 'cnaes.csv');
  
  console.log('📋 Importando CNAEs...');
  
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  let batch = [];
  const batchSize = 1000;

  await client.query('BEGIN');
  
  try {
    // Limpar tabela antes de importar
    await client.query('DELETE FROM cnaes');
    
    for await (const line of rl) {
      if (!line.trim()) continue;
      
      const data = processReferenceCSVLine(line);
      
      if (data.codigo && data.descricao) {
        batch.push(data);
        
        if (batch.length >= batchSize) {
          await processCNAEBatch(batch);
          count += batch.length;
          batch = [];
          
          if (count % 5000 === 0) {
            console.log(`📈 CNAEs processados: ${count.toLocaleString()}`);
          }
        }
      }
    }
    
    // Processar último lote
    if (batch.length > 0) {
      await processCNAEBatch(batch);
      count += batch.length;
    }
    
    await client.query('COMMIT');
    console.log(`✅ CNAEs importados: ${count.toLocaleString()}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao importar CNAEs:', error.message);
    throw error;
  }
  
  rl.close();
}

async function processCNAEBatch(batch) {
  const query = `
    INSERT INTO cnaes (codigo, descricao)
    VALUES ($1, $2)
    ON CONFLICT (codigo) DO UPDATE SET
      descricao = EXCLUDED.descricao
  `;
  
  for (const item of batch) {
    await client.query(query, [item.codigo, item.descricao]);
  }
}

// Função para importar Municípios
async function importMunicipalities() {
  const csvPath = path.join(__dirname, '..', 'CNPJ_Matrix', 'municipios.csv');
  
  console.log('🏙️ Importando Municípios...');
  
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  let batch = [];
  const batchSize = 1000;

  await client.query('BEGIN');
  
  try {
    // Limpar tabela antes de importar
    await client.query('DELETE FROM municipalities');
    
    for await (const line of rl) {
      if (!line.trim()) continue;
      
      const data = processReferenceCSVLine(line);
      
      if (data.codigo && data.descricao) {
        batch.push(data);
        
        if (batch.length >= batchSize) {
          await processMunicipalityBatch(batch);
          count += batch.length;
          batch = [];
          
          if (count % 1000 === 0) {
            console.log(`📈 Municípios processados: ${count.toLocaleString()}`);
          }
        }
      }
    }
    
    // Processar último lote
    if (batch.length > 0) {
      await processMunicipalityBatch(batch);
      count += batch.length;
    }
    
    await client.query('COMMIT');
    console.log(`✅ Municípios importados: ${count.toLocaleString()}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao importar Municípios:', error.message);
    throw error;
  }
  
  rl.close();
}

async function processMunicipalityBatch(batch) {
  const query = `
    INSERT INTO municipalities (codigo, descricao)
    VALUES ($1, $2)
    ON CONFLICT (codigo) DO UPDATE SET
      descricao = EXCLUDED.descricao
  `;
  
  for (const item of batch) {
    await client.query(query, [item.codigo, item.descricao]);
  }
}

// Função para importar Naturezas Jurídicas
async function importLegalNatures() {
  const csvPath = path.join(__dirname, '..', 'CNPJ_Matrix', 'naturezas.csv');
  
  console.log('⚖️ Importando Naturezas Jurídicas...');
  
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  let batch = [];
  const batchSize = 1000;

  await client.query('BEGIN');
  
  try {
    // Limpar tabela antes de importar
    await client.query('DELETE FROM legal_natures');
    
    for await (const line of rl) {
      if (!line.trim()) continue;
      
      const data = processReferenceCSVLine(line);
      
      if (data.codigo && data.descricao) {
        batch.push(data);
        
        if (batch.length >= batchSize) {
          await processLegalNatureBatch(batch);
          count += batch.length;
          batch = [];
          
          if (count % 500 === 0) {
            console.log(`📈 Naturezas Jurídicas processadas: ${count.toLocaleString()}`);
          }
        }
      }
    }
    
    // Processar último lote
    if (batch.length > 0) {
      await processLegalNatureBatch(batch);
      count += batch.length;
    }
    
    await client.query('COMMIT');
    console.log(`✅ Naturezas Jurídicas importadas: ${count.toLocaleString()}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao importar Naturezas Jurídicas:', error.message);
    throw error;
  }
  
  rl.close();
}

async function processLegalNatureBatch(batch) {
  const query = `
    INSERT INTO legal_natures (codigo, descricao)
    VALUES ($1, $2)
    ON CONFLICT (codigo) DO UPDATE SET
      descricao = EXCLUDED.descricao
  `;
  
  for (const item of batch) {
    await client.query(query, [item.codigo, item.descricao]);
  }
}

// Função para importar Motivos de Situação Cadastral
async function importMotivos() {
  const csvPath = path.join(__dirname, '..', 'CNPJ_Matrix', 'motivos.csv');
  
  console.log('📝 Importando Motivos de Situação Cadastral...');
  
  // Primeiro, vamos criar a tabela se não existir
  await client.query(`
    CREATE TABLE IF NOT EXISTS cadastral_situation_reasons (
      codigo INTEGER PRIMARY KEY,
      descricao TEXT
    )
  `);
  
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  let batch = [];
  const batchSize = 1000;

  await client.query('BEGIN');
  
  try {
    // Limpar tabela antes de importar
    await client.query('DELETE FROM cadastral_situation_reasons');
    
    for await (const line of rl) {
      if (!line.trim()) continue;
      
      const data = processReferenceCSVLine(line);
      
      if (data.codigo !== null && data.descricao) {
        batch.push(data);
        
        if (batch.length >= batchSize) {
          await processMotivosBatch(batch);
          count += batch.length;
          batch = [];
          
          if (count % 100 === 0) {
            console.log(`📈 Motivos processados: ${count.toLocaleString()}`);
          }
        }
      }
    }
    
    // Processar último lote
    if (batch.length > 0) {
      await processMotivosBatch(batch);
      count += batch.length;
    }
    
    await client.query('COMMIT');
    console.log(`✅ Motivos importados: ${count.toLocaleString()}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Erro ao importar Motivos:', error.message);
    throw error;
  }
  
  rl.close();
}

async function processMotivosBatch(batch) {
  const query = `
    INSERT INTO cadastral_situation_reasons (codigo, descricao)
    VALUES ($1, $2)
    ON CONFLICT (codigo) DO UPDATE SET
      descricao = EXCLUDED.descricao
  `;
  
  for (const item of batch) {
    await client.query(query, [item.codigo, item.descricao]);
  }
}

// Função principal
async function importAllReferenceTables() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    const startTime = Date.now();
    
    // Importar todas as tabelas de referência
    await importCNAEs();
    await importMunicipalities();
    await importLegalNatures();
    await importMotivos();
    
    const endTime = Date.now();
    const totalTime = (endTime - startTime) / 1000;
    
    // Verificar quantos registros foram inseridos
    const cnaeCount = await client.query('SELECT COUNT(*) FROM cnaes');
    const municipalityCount = await client.query('SELECT COUNT(*) FROM municipalities');
    const legalNatureCount = await client.query('SELECT COUNT(*) FROM legal_natures');
    const motivoCount = await client.query('SELECT COUNT(*) FROM cadastral_situation_reasons');
    
    console.log('\n🎉 === IMPORTAÇÃO DE TABELAS DE REFERÊNCIA CONCLUÍDA ===');
    console.log(`📋 CNAEs importados: ${cnaeCount.rows[0].count}`);
    console.log(`🏙️ Municípios importados: ${municipalityCount.rows[0].count}`);
    console.log(`⚖️ Naturezas Jurídicas importadas: ${legalNatureCount.rows[0].count}`);
    console.log(`📝 Motivos importados: ${motivoCount.rows[0].count}`);
    console.log(`⏱️ Tempo total: ${Math.floor(totalTime / 60)}m ${Math.floor(totalTime % 60)}s`);
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  } finally {
    await client.end();
    console.log('🔌 Conexão com banco encerrada.');
  }
}

// Executar o script
if (require.main === module) {
  console.log('🚀 Iniciando importação das tabelas de referência...');
  importAllReferenceTables().catch(console.error);
}

module.exports = { 
  importAllReferenceTables,
  importCNAEs,
  importMunicipalities,
  importLegalNatures,
  importMotivos
};