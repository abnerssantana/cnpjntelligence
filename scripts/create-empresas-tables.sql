-- Create empresas table
CREATE TABLE IF NOT EXISTS empresas (
  id SERIAL PRIMARY KEY,
  cnpj VARCHAR(14) UNIQUE NOT NULL,
  razao_social VARCHAR(255) NOT NULL,
  nome_fantasia VARCHAR(255),
  logradouro VARCHAR(255),
  numero VARCHAR(20),
  complemento VARCHAR(255),
  bairro VARCHAR(100),
  municipio VARCHAR(100),
  uf VARCHAR(2),
  cep VARCHAR(8),
  email VARCHAR(255),
  porte VARCHAR(50),
  natureza_juridica VARCHAR(100),
  capital_social DECIMAL(15,2),
  cnae_fiscal INTEGER,
  cnae_fiscal_descricao VARCHAR(255),
  situacao_cadastral INTEGER,
  descricao_situacao_cadastral VARCHAR(50),
  data_situacao_cadastral DATE,
  data_inicio_atividade DATE,
  last_api_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create empresa_socios table
CREATE TABLE IF NOT EXISTS empresa_socios (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome_socio VARCHAR(255) NOT NULL,
  cnpj_cpf_do_socio VARCHAR(20),
  qualificacao_socio VARCHAR(100),
  data_entrada_sociedade DATE,
  faixa_etaria VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create empresa_cnaes_secundarios table
CREATE TABLE IF NOT EXISTS empresa_cnaes_secundarios (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  codigo INTEGER NOT NULL,
  descricao VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_razao_social ON empresas(razao_social);
CREATE INDEX IF NOT EXISTS idx_empresas_uf ON empresas(uf);
CREATE INDEX IF NOT EXISTS idx_empresas_municipio ON empresas(municipio);
CREATE INDEX IF NOT EXISTS idx_empresas_cnae_fiscal ON empresas(cnae_fiscal);
CREATE INDEX IF NOT EXISTS idx_empresa_socios_empresa_id ON empresa_socios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresa_socios_nome ON empresa_socios(nome_socio);
CREATE INDEX IF NOT EXISTS idx_empresa_cnaes_empresa_id ON empresa_cnaes_secundarios(empresa_id);