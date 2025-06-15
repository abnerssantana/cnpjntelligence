const fs = require('fs');
const axios = require('axios');
const path = require('path');

// CONFIGURE: Caminho do arquivo TXT e URL da API
const TXT_FILE = process.argv[2] || path.join(__dirname, 'cnpjs.txt');
const API_URL = process.argv[3] || 'http://localhost:3000/api/cnpj/import';

async function importCnpjs() {
  if (!fs.existsSync(TXT_FILE)) {
    console.error(`Arquivo não encontrado: ${TXT_FILE}`);
    process.exit(1);
  }

  const cnpjs = fs.readFileSync(TXT_FILE, 'utf-8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  console.log(`Importando ${cnpjs.length} CNPJs do arquivo ${TXT_FILE}`);

  for (let i = 0; i < cnpjs.length; i++) {
    const cnpj = cnpjs[i];
    try {
      const res = await axios.post(API_URL, { cnpj });
      if (res.data && res.data.success) {
        console.log(`[${i+1}/${cnpjs.length}] CNPJ ${cnpj}: OK (empresaId: ${res.data.empresaId})`);
      } else {
        console.log(`[${i+1}/${cnpjs.length}] CNPJ ${cnpj}: ERRO`, res.data);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        console.log(`[${i+1}/${cnpjs.length}] CNPJ ${cnpj}: ERRO`, err.response.data);
      } else {
        console.log(`[${i+1}/${cnpjs.length}] CNPJ ${cnpj}: ERRO`, err.message);
      }
    }
    // Aguarda 1 segundo entre requisições para evitar rate limit
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('Importação concluída.');
}

importCnpjs();
