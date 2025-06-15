const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Configuração da conexão com o banco
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const client = new Client({
  connectionString: process.env.POSTGRES_URL
});

async function verifyImport() {
  try {
    await client.connect();
    
    // Check empresa
    const empresaResult = await client.query(`
      SELECT * FROM empresas WHERE cnpj = '33683111000280'
    `);
    
    if (empresaResult.rows.length > 0) {
      console.log('✅ Empresa encontrada:');
      const empresa = empresaResult.rows[0];
      console.log(`  - CNPJ: ${empresa.cnpj}`);
      console.log(`  - Razão Social: ${empresa.razao_social}`);
      console.log(`  - Nome Fantasia: ${empresa.nome_fantasia}`);
      console.log(`  - Endereço: ${empresa.logradouro}, ${empresa.numero}`);
      console.log(`  - Município/UF: ${empresa.municipio}/${empresa.uf}`);
      console.log(`  - CNAE: ${empresa.cnae_fiscal} - ${empresa.cnae_fiscal_descricao}`);
      console.log(`  - Situação: ${empresa.descricao_situacao_cadastral}`);
      
      // Check socios
      const sociosResult = await client.query(`
        SELECT * FROM empresa_socios WHERE empresa_id = $1
      `, [empresa.id]);
      
      console.log(`\n👥 Sócios (${sociosResult.rows.length}):`);
      sociosResult.rows.forEach(socio => {
        console.log(`  - ${socio.nome_socio} (${socio.qualificacao_socio})`);
      });
      
      // Check CNAEs secundários
      const cnaesResult = await client.query(`
        SELECT * FROM empresa_cnaes_secundarios WHERE empresa_id = $1
      `, [empresa.id]);
      
      console.log(`\n📋 CNAEs Secundários (${cnaesResult.rows.length}):`);
      cnaesResult.rows.forEach(cnae => {
        console.log(`  - ${cnae.codigo}: ${cnae.descricao}`);
      });
    } else {
      console.log('❌ Empresa não encontrada');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

verifyImport();