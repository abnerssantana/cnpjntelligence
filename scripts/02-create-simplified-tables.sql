-- Drop existing tables if they exist
DROP TABLE IF EXISTS empresa_socios CASCADE;
DROP TABLE IF EXISTS empresa_cnaes_secundarios CASCADE;
DROP TABLE IF EXISTS empresas CASCADE;

-- Main company table with all data from API
CREATE TABLE empresas (
    id SERIAL PRIMARY KEY,
    cnpj VARCHAR(14) UNIQUE NOT NULL,
    razao_social TEXT NOT NULL,
    nome_fantasia TEXT,
    
    -- Address
    logradouro TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    municipio TEXT,
    uf VARCHAR(2),
    cep VARCHAR(8),
    pais TEXT,
    
    -- Contact
    email TEXT,
    ddd_telefone_1 VARCHAR(4),
    ddd_telefone_2 VARCHAR(4),
    ddd_fax VARCHAR(4),
    
    -- Company details
    porte VARCHAR(50),
    codigo_porte INTEGER,
    natureza_juridica TEXT,
    codigo_natureza_juridica INTEGER,
    capital_social DECIMAL(15,2),
    
    -- Main CNAE
    cnae_fiscal INTEGER,
    cnae_fiscal_descricao TEXT,
    
    -- Status
    situacao_cadastral INTEGER,
    descricao_situacao_cadastral TEXT,
    data_situacao_cadastral DATE,
    motivo_situacao_cadastral INTEGER,
    descricao_motivo_situacao_cadastral TEXT,
    
    -- Special situation
    situacao_especial TEXT,
    data_situacao_especial DATE,
    
    -- Tax options
    opcao_pelo_simples BOOLEAN,
    data_opcao_pelo_simples DATE,
    data_exclusao_do_simples DATE,
    opcao_pelo_mei BOOLEAN,
    data_opcao_pelo_mei DATE,
    data_exclusao_do_mei DATE,
    regime_tributario TEXT,
    
    -- Other info
    data_inicio_atividade DATE,
    identificador_matriz_filial INTEGER,
    descricao_identificador_matriz_filial TEXT,
    ente_federativo_responsavel TEXT,
    qualificacao_do_responsavel INTEGER,
    
    -- Location codes
    codigo_municipio INTEGER,
    codigo_municipio_ibge INTEGER,
    codigo_pais INTEGER,
    nome_cidade_no_exterior TEXT,
    descricao_tipo_de_logradouro TEXT,
    
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_api_sync TIMESTAMP DEFAULT NOW()
);

-- Partners/Associates table (QSA)
CREATE TABLE empresa_socios (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    nome_socio TEXT NOT NULL,
    cnpj_cpf_do_socio VARCHAR(14),
    qualificacao_socio TEXT,
    codigo_qualificacao_socio INTEGER,
    data_entrada_sociedade DATE,
    
    -- Age range
    faixa_etaria TEXT,
    codigo_faixa_etaria INTEGER,
    
    -- Country
    pais TEXT,
    codigo_pais INTEGER,
    
    -- Legal representative
    cpf_representante_legal VARCHAR(14),
    nome_representante_legal TEXT,
    qualificacao_representante_legal TEXT,
    codigo_qualificacao_representante_legal INTEGER,
    
    -- Partner type
    identificador_de_socio INTEGER,
    
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Secondary CNAEs table
CREATE TABLE empresa_cnaes_secundarios (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL,
    codigo INTEGER NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_empresas_cnpj ON empresas(cnpj);
CREATE INDEX idx_empresas_razao_social ON empresas(razao_social);
CREATE INDEX idx_empresas_nome_fantasia ON empresas(nome_fantasia);
CREATE INDEX idx_empresas_uf ON empresas(uf);
CREATE INDEX idx_empresas_municipio ON empresas(municipio);
CREATE INDEX idx_empresas_cnae_fiscal ON empresas(cnae_fiscal);
CREATE INDEX idx_empresas_situacao_cadastral ON empresas(situacao_cadastral);
CREATE INDEX idx_empresas_porte ON empresas(codigo_porte);
CREATE INDEX idx_empresas_natureza_juridica ON empresas(codigo_natureza_juridica);
CREATE INDEX idx_empresas_last_api_sync ON empresas(last_api_sync);

CREATE INDEX idx_empresa_socios_empresa_id ON empresa_socios(empresa_id);
CREATE INDEX idx_empresa_socios_nome ON empresa_socios(nome_socio);
CREATE INDEX idx_empresa_socios_cpf_cnpj ON empresa_socios(cnpj_cpf_do_socio);

CREATE INDEX idx_empresa_cnaes_empresa_id ON empresa_cnaes_secundarios(empresa_id);
CREATE INDEX idx_empresa_cnaes_codigo ON empresa_cnaes_secundarios(codigo);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();