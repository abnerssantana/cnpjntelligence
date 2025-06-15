const { importCompany } = require('./import-from-api');

async function testImport() {
  console.log('Testing CNPJ import...');
  
  // Test with the CNPJ you provided
  const cnpj = '33.683.111/0002-80';
  
  console.log(`Importing CNPJ: ${cnpj}`);
  const success = await importCompany(cnpj);
  
  if (success) {
    console.log('✅ Import successful!');
  } else {
    console.log('❌ Import failed!');
  }
}

testImport().catch(console.error);