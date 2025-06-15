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
  console.log(`[DEBUG] Verificando existência do arquivo: ${csvPath}`);
  if (!fs.existsSync(csvPath)) {
    throw new Error(`[ERRO] Arquivo não encontrado: ${csvPath}`);
  }
  console.log('[DEBUG] Arquivo encontrado. Iniciando contagem de linhas...');

  let totalLines = 0;
  try {
    totalLines = await new Promise((resolve, reject) => {
      let lines = 0;
      fs.createReadStream(csvPath)
        .on('data', (buffer) => {
          let idx = -1;
          lines--;
          do {
            idx = buffer.indexOf(10, idx + 1);
            lines++;
          } while (idx !== -1);
        })
        .on('end', () => {
          console.log(`[DEBUG] Contagem de linhas concluída: ${lines}`);
          resolve(lines);
        })
        .on('error', (err) => {
          console.error('[ERRO] Falha ao ler arquivo para contagem de linhas:', err);
          reject(err);
        });
    });
  } catch (err) {
    console.warn('[WARN] Falha na contagem de linhas, usando valor padrão 1359.');
    totalLines = 1359;
  }
  
  console.log('[DEBUG] Abrindo arquivo para leitura linha a linha...');
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  let batch = [];
  let lineNumber = 0;
  const batchSize = 100;
  let totalInserted = 0;
  let totalUpdated = 0;
  const progressStep = 100;

  try {
    // Não apagar a tabela antes de importar, apenas inserir/atualizar diferenças
    
    for await (const line of rl) {
      lineNumber++;
      if (!line.trim()) continue;
      
      const data = processReferenceCSVLine(line);
      
      if (data.codigo && data.descricao) {
        batch.push({ ...data, _line: lineNumber });
      } else {
        console.warn(`⚠️ Linha ${lineNumber} ignorada: dados inválidos.`);
      }
      // Sempre que atingir o passo de progresso OU o batch encher, grava no banco
      if (batch.length >= batchSize || lineNumber % progressStep === 0 || lineNumber === totalLines) {
        if (batch.length > 0) {
          const { inserted, updated } = await processCNAEBatch(batch);
          totalInserted += inserted;
          totalUpdated += updated;
          count += batch.length;
          batch = [];
        }
        const percent = ((lineNumber / totalLines) * 100).toFixed(1);
        console.log(`📊 Progresso: ${lineNumber.toLocaleString()} / ${totalLines.toLocaleString()} linhas (${percent}%)`);
      }
    }
    
    // Processar último lote
    if (batch.length > 0) {
      const { inserted, updated } = await processCNAEBatch(batch);
      totalInserted += inserted;
      totalUpdated += updated;
      count += batch.length;
    }
    
    console.log(`✅ CNAEs importados: ${count.toLocaleString()} (inseridos: ${totalInserted}, atualizados: ${totalUpdated})`);
    
  } catch (error) {
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
    RETURNING xmax
  `;
  let inserted = 0;
  let updated = 0;
  await client.query('BEGIN');
  try {
    for (const item of batch) {
      try {
        const res = await client.query(query, [item.codigo, item.descricao]);
        if (res.rows && res.rows[0] && res.rows[0].xmax === '0') {
          inserted++;
        } else {
          updated++;
        }
      } catch (err) {
        console.error(`❌ Erro na linha ${item._line} (codigo: ${item.codigo}): ${err.message}`);
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
  return { inserted, updated };
}

// Função para importar Municípios
async function importMunicipalities() {
  const csvPath = path.join(__dirname, '..', 'CNPJ_Matrix', 'municipios.csv');
  
  console.log('🏙️ Importando Municípios...');
  console.log(`[DEBUG] Verificando existência do arquivo: ${csvPath}`);
  if (!fs.existsSync(csvPath)) {
    throw new Error(`[ERRO] Arquivo não encontrado: ${csvPath}`);
  }
  console.log('[DEBUG] Arquivo encontrado. Iniciando contagem de linhas...');

  let totalLines = 0;
  try {
    totalLines = await new Promise((resolve, reject) => {
      let lines = 0;
      fs.createReadStream(csvPath)
        .on('data', (buffer) => {
          let idx = -1;
          lines--;
          do {
            idx = buffer.indexOf(10, idx + 1);
            lines++;
          } while (idx !== -1);
        })
        .on('end', () => {
          console.log(`[DEBUG] Contagem de linhas concluída: ${lines}`);
          resolve(lines);
        })
        .on('error', (err) => {
          console.error('[ERRO] Falha ao ler arquivo para contagem de linhas:', err);
          reject(err);
        });
    });
  } catch (err) {
    console.warn('[WARN] Falha na contagem de linhas, usando valor padrão 10000.');
    totalLines = 10000;
  }
  
  console.log('[DEBUG] Abrindo arquivo para leitura linha a linha...');
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  let batch = [];
  let lineNumber = 0;
  const batchSize = 100;
  let totalInserted = 0;
  let totalUpdated = 0;
  const progressStep = 100;

  try {
    // Não apagar a tabela antes de importar, apenas inserir/atualizar diferenças
    for await (const line of rl) {
      lineNumber++;
      if (!line.trim()) continue;
      const data = processReferenceCSVLine(line);
      if (data.codigo && data.descricao) {
        batch.push({ ...data, _line: lineNumber });
      } else {
        console.warn(`⚠️ Linha ${lineNumber} ignorada: dados inválidos.`);
      }
      if (batch.length >= batchSize || lineNumber % progressStep === 0 || lineNumber === totalLines) {
        if (batch.length > 0) {
          const { inserted, updated } = await processMunicipalityBatch(batch);
          totalInserted += inserted;
          totalUpdated += updated;
          count += batch.length;
          batch = [];
        }
        const percent = ((lineNumber / totalLines) * 100).toFixed(1);
        console.log(`📊 Progresso: ${lineNumber.toLocaleString()} / ${totalLines.toLocaleString()} linhas (${percent}%)`);
      }
    }
    if (batch.length > 0) {
      const { inserted, updated } = await processMunicipalityBatch(batch);
      totalInserted += inserted;
      totalUpdated += updated;
      count += batch.length;
    }
    console.log(`✅ Municípios importados: ${count.toLocaleString()} (inseridos: ${totalInserted}, atualizados: ${totalUpdated})`);
  } catch (error) {
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
    RETURNING xmax
  `;
  let inserted = 0;
  let updated = 0;
  await client.query('BEGIN');
  try {
    for (const item of batch) {
      try {
        const res = await client.query(query, [item.codigo, item.descricao]);
        if (res.rows && res.rows[0] && res.rows[0].xmax === '0') {
          inserted++;
        } else {
          updated++;
        }
      } catch (err) {
        console.error(`❌ Erro na linha ${item._line} (codigo: ${item.codigo}): ${err.message}`);
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
  return { inserted, updated };
}

// Função para importar Naturezas Jurídicas
async function importLegalNatures() {
  const csvPath = path.join(__dirname, '..', 'CNPJ_Matrix', 'naturezas.csv');
  
  console.log('⚖️ Importando Naturezas Jurídicas...');
  console.log(`[DEBUG] Verificando existência do arquivo: ${csvPath}`);
  if (!fs.existsSync(csvPath)) {
    throw new Error(`[ERRO] Arquivo não encontrado: ${csvPath}`);
  }
  console.log('[DEBUG] Arquivo encontrado. Iniciando contagem de linhas...');

  let totalLines = 0;
  try {
    totalLines = await new Promise((resolve, reject) => {
      let lines = 0;
      fs.createReadStream(csvPath)
        .on('data', (buffer) => {
          let idx = -1;
          lines--;
          do {
            idx = buffer.indexOf(10, idx + 1);
            lines++;
          } while (idx !== -1);
        })
        .on('end', () => {
          console.log(`[DEBUG] Contagem de linhas concluída: ${lines}`);
          resolve(lines);
        })
        .on('error', (err) => {
          console.error('[ERRO] Falha ao ler arquivo para contagem de linhas:', err);
          reject(err);
        });
    });
  } catch (err) {
    console.warn('[WARN] Falha na contagem de linhas, usando valor padrão 10000.');
    totalLines = 10000;
  }
  
  console.log('[DEBUG] Abrindo arquivo para leitura linha a linha...');
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  let batch = [];
  let lineNumber = 0;
  const batchSize = 10;
  let totalInserted = 0;
  let totalUpdated = 0;
  const progressStep = 10;

  try {
    // Não apagar a tabela antes de importar, apenas inserir/atualizar diferenças
    for await (const line of rl) {
      lineNumber++;
      if (!line.trim()) continue;
      const data = processReferenceCSVLine(line);
      if (data.codigo && data.descricao) {
        batch.push({ ...data, _line: lineNumber });
      } else {
        console.warn(`⚠️ Linha ${lineNumber} ignorada: dados inválidos.`);
      }
      if (batch.length >= batchSize || lineNumber % progressStep === 0 || lineNumber === totalLines) {
        if (batch.length > 0) {
          const { inserted, updated } = await processLegalNatureBatch(batch);
          totalInserted += inserted;
          totalUpdated += updated;
          count += batch.length;
          batch = [];
        }
        const percent = ((lineNumber / totalLines) * 100).toFixed(1);
        console.log(`📊 Progresso: ${lineNumber.toLocaleString()} / ${totalLines.toLocaleString()} linhas (${percent}%)`);
      }
    }
    if (batch.length > 0) {
      const { inserted, updated } = await processLegalNatureBatch(batch);
      totalInserted += inserted;
      totalUpdated += updated;
      count += batch.length;
    }
    console.log(`✅ Naturezas Jurídicas importadas: ${count.toLocaleString()} (inseridos: ${totalInserted}, atualizados: ${totalUpdated})`);
  } catch (error) {
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
    RETURNING xmax
  `;
  let inserted = 0;
  let updated = 0;
  await client.query('BEGIN');
  try {
    for (const item of batch) {
      try {
        const res = await client.query(query, [item.codigo, item.descricao]);
        if (res.rows && res.rows[0] && res.rows[0].xmax === '0') {
          inserted++;
        } else {
          updated++;
        }
      } catch (err) {
        console.error(`❌ Erro na linha ${item._line} (codigo: ${item.codigo}): ${err.message}`);
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
  return { inserted, updated };
}

// Função para importar Motivos de Situação Cadastral
async function importMotivos() {
  const csvPath = path.join(__dirname, '..', 'CNPJ_Matrix', 'motivos.csv');
  
  console.log('📝 Importando Motivos de Situação Cadastral...');
  console.log(`[DEBUG] Verificando existência do arquivo: ${csvPath}`);
  if (!fs.existsSync(csvPath)) {
    throw new Error(`[ERRO] Arquivo não encontrado: ${csvPath}`);
  }
  console.log('[DEBUG] Arquivo encontrado. Iniciando contagem de linhas...');

  // Primeiro, vamos criar a tabela se não existir
  await client.query(`
    CREATE TABLE IF NOT EXISTS cadastral_situation_reasons (
      codigo INTEGER PRIMARY KEY,
      descricao TEXT
    )
  `);

  let totalLines = 0;
  try {
    totalLines = await new Promise((resolve, reject) => {
      let lines = 0;
      fs.createReadStream(csvPath)
        .on('data', (buffer) => {
          let idx = -1;
          lines--;
          do {
            idx = buffer.indexOf(10, idx + 1);
            lines++;
          } while (idx !== -1);
        })
        .on('end', () => {
          console.log(`[DEBUG] Contagem de linhas concluída: ${lines}`);
          resolve(lines);
        })
        .on('error', (err) => {
          console.error('[ERRO] Falha ao ler arquivo para contagem de linhas:', err);
          reject(err);
        });
    });
  } catch (err) {
    console.warn('[WARN] Falha na contagem de linhas, usando valor padrão 10000.');
    totalLines = 10000;
  }
  
  console.log('[DEBUG] Abrindo arquivo para leitura linha a linha...');
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  let batch = [];
  let lineNumber = 0;
  const batchSize = 10;
  let totalInserted = 0;
  let totalUpdated = 0;
  const progressStep = 10;

  try {
    // Não apagar a tabela antes de importar, apenas inserir/atualizar diferenças
    for await (const line of rl) {
      lineNumber++;
      if (!line.trim()) continue;
      const data = processReferenceCSVLine(line);
      if (data.codigo !== null && data.descricao) {
        batch.push({ ...data, _line: lineNumber });
      } else {
        console.warn(`⚠️ Linha ${lineNumber} ignorada: dados inválidos.`);
      }
      if (batch.length >= batchSize || lineNumber % progressStep === 0 || lineNumber === totalLines) {
        if (batch.length > 0) {
          const { inserted, updated } = await processMotivosBatch(batch);
          totalInserted += inserted;
          totalUpdated += updated;
          count += batch.length;
          batch = [];
        }
        const percent = ((lineNumber / totalLines) * 100).toFixed(1);
        console.log(`📊 Progresso: ${lineNumber.toLocaleString()} / ${totalLines.toLocaleString()} linhas (${percent}%)`);
      }
    }
    if (batch.length > 0) {
      const { inserted, updated } = await processMotivosBatch(batch);
      totalInserted += inserted;
      totalUpdated += updated;
      count += batch.length;
    }
    console.log(`✅ Motivos importados: ${count.toLocaleString()} (inseridos: ${totalInserted}, atualizados: ${totalUpdated})`);
  } catch (error) {
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
    RETURNING xmax
  `;
  let inserted = 0;
  let updated = 0;
  await client.query('BEGIN');
  try {
    for (const item of batch) {
      try {
        const res = await client.query(query, [item.codigo, item.descricao]);
        if (res.rows && res.rows[0] && res.rows[0].xmax === '0') {
          inserted++;
        } else {
          updated++;
        }
      } catch (err) {
        console.error(`❌ Erro na linha ${item._line} (codigo: ${item.codigo}): ${err.message}`);
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  }
  return { inserted, updated };
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