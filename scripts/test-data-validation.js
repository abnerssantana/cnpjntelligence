const fs = require('fs');
const path = require('path');
const readline = require('readline');

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
  const fields = line.split(';').map(field => 
    field.replace(/^"/, '').replace(/"$/, '').trim()
  );
  
  return {
    cnpj_basico: cleanString(fields[0]),
    cnpj_ordem: cleanString(fields[1]),
    cnpj_dv: cleanString(fields[2]),
    identificador_matriz_filial: safeParseInt(fields[3]),
    situacao_cadastral: safeParseInt(fields[5]),
    motivo_situacao_cadastral: safeParseInt(fields[7]),
    pais: safeParseInt(fields[9]),
    municipio: safeParseInt(fields[20])
  };
}

async function testDataValidation() {
  const csvPath = path.join(__dirname, '..', 'CNPJ_Matrix', 'base.csv');
  
  try {
    console.log('🔍 Testando validação de dados...');
    
    const fileStream = fs.createReadStream(csvPath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    let problemLines = [];
    const maxTestLines = 1000;

    for await (const line of rl) {
      if (!line.trim() || lineCount >= maxTestLines) break;
      
      lineCount++;
      
      try {
        const data = processCSVLine(line);
        
        // Verificar se há valores NaN
        const integerFields = [
          'identificador_matriz_filial',
          'situacao_cadastral', 
          'motivo_situacao_cadastral',
          'pais',
          'municipio'
        ];
        
        let hasNaN = false;
        const nanFields = [];
        
        integerFields.forEach(field => {
          if (data[field] === 'NaN' || (typeof data[field] === 'string' && data[field].includes('NaN'))) {
            hasNaN = true;
            nanFields.push(field);
          }
        });
        
        if (hasNaN) {
          problemLines.push({
            line: lineCount,
            cnpj: `${data.cnpj_basico}${data.cnpj_ordem}${data.cnpj_dv}`,
            nanFields: nanFields,
            rawLine: line.substring(0, 100) + '...'
          });
        }
        
        // Log de exemplo das primeiras 5 linhas
        if (lineCount <= 5) {
          console.log(`\nLinha ${lineCount}:`);
          console.log(`  CNPJ: ${data.cnpj_basico}${data.cnpj_ordem}${data.cnpj_dv}`);
          console.log(`  Identificador: ${data.identificador_matriz_filial}`);
          console.log(`  Situação: ${data.situacao_cadastral}`);
          console.log(`  Motivo: ${data.motivo_situacao_cadastral}`);
          console.log(`  País: ${data.pais}`);
          console.log(`  Município: ${data.municipio}`);
        }
        
      } catch (error) {
        console.error(`Erro na linha ${lineCount}:`, error.message);
      }
    }

    rl.close();
    
    console.log('\n📊 === RESULTADO DO TESTE ===');
    console.log(`Linhas testadas: ${lineCount}`);
    console.log(`Problemas encontrados: ${problemLines.length}`);
    
    if (problemLines.length > 0) {
      console.log('\n❌ Linhas com problemas:');
      problemLines.slice(0, 10).forEach(problem => {
        console.log(`  Linha ${problem.line}: ${problem.cnpj} - Campos NaN: ${problem.nanFields.join(', ')}`);
      });
      
      if (problemLines.length > 10) {
        console.log(`  ... e mais ${problemLines.length - 10} linhas com problemas`);
      }
    } else {
      console.log('✅ Nenhum problema encontrado nas linhas testadas!');
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  }
}

testDataValidation().catch(console.error);