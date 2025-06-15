-- Companies table (Empresas)
CREATE TABLE companies (
    cnpj_basico VARCHAR(8) PRIMARY KEY,
    razao_social TEXT,
    natureza_juridica INTEGER,
    qualificacao_responsavel INTEGER,
    capital_social DECIMAL(15,2),
    porte_empresa INTEGER,
    ente_federativo_responsavel TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (natureza_juridica) REFERENCES legal_natures(codigo)
);

-- Establishments table (Estabelecimentos)
CREATE TABLE establishments (
    id SERIAL PRIMARY KEY,
    cnpj_basico VARCHAR(8),
    cnpj_ordem VARCHAR(4),
    cnpj_dv VARCHAR(2),
    cnpj_completo VARCHAR(14) GENERATED ALWAYS AS (cnpj_basico || cnpj_ordem || cnpj_dv) STORED,
    identificador_matriz_filial INTEGER,
    nome_fantasia TEXT,
    situacao_cadastral INTEGER,
    data_situacao_cadastral DATE,
    motivo_situacao_cadastral INTEGER,
    nome_cidade_exterior TEXT,
    pais INTEGER,
    data_inicio_atividade DATE,
    cnae_fiscal_principal VARCHAR(7),
    cnae_fiscal_secundaria TEXT,
    tipo_logradouro TEXT,
    logradouro TEXT,
    numero TEXT,
    complemento TEXT,
    bairro TEXT,
    cep VARCHAR(8),
    uf VARCHAR(2),
    municipio INTEGER,
    ddd1 VARCHAR(3),
    telefone1 VARCHAR(8),
    ddd2 VARCHAR(3),
    telefone2 VARCHAR(8),
    ddd_fax VARCHAR(3),
    fax VARCHAR(8),
    correio_eletronico TEXT,
    situacao_especial TEXT,
    data_situacao_especial DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (cnpj_basico) REFERENCES companies(cnpj_basico),
    FOREIGN KEY (municipio) REFERENCES municipalities(codigo),
    FOREIGN KEY (cnae_fiscal_principal) REFERENCES cnaes(codigo)
);

-- Simples data table
CREATE TABLE simples_data (
    cnpj_basico VARCHAR(8) PRIMARY KEY,
    opcao_pelo_simples CHAR(1),
    data_opcao_simples DATE,
    data_exclusao_simples DATE,
    opcao_pelo_mei CHAR(1),
    data_opcao_mei DATE,
    data_exclusao_mei DATE,
    FOREIGN KEY (cnpj_basico) REFERENCES companies(cnpj_basico)
);

-- Partners table (Sócios)
CREATE TABLE partners (
    id SERIAL PRIMARY KEY,
    cnpj_basico VARCHAR(8),
    identificador_socio INTEGER,
    nome_socio TEXT,
    cnpj_cpf_socio VARCHAR(14),
    qualificacao_socio INTEGER,
    data_entrada_sociedade DATE,
    pais INTEGER,
    representante_legal VARCHAR(11),
    nome_representante TEXT,
    qualificacao_representante INTEGER,
    faixa_etaria INTEGER,
    FOREIGN KEY (cnpj_basico) REFERENCES companies(cnpj_basico)
);

-- Reference tables
CREATE TABLE countries (
    codigo INTEGER PRIMARY KEY,
    descricao TEXT
);

CREATE TABLE municipalities (
    codigo INTEGER PRIMARY KEY,
    descricao TEXT
);

CREATE TABLE partner_qualifications (
    codigo INTEGER PRIMARY KEY,
    descricao TEXT
);

CREATE TABLE legal_natures (
    codigo INTEGER PRIMARY KEY,
    descricao TEXT
);

CREATE TABLE cnaes (
    codigo VARCHAR(7) PRIMARY KEY,
    descricao TEXT
);

-- Users and subscriptions
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    subscription_status TEXT DEFAULT 'trial',
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_establishments_cnpj_basico ON establishments(cnpj_basico);
CREATE INDEX idx_establishments_uf ON establishments(uf);
CREATE INDEX idx_establishments_municipio ON establishments(municipio);
CREATE INDEX idx_establishments_cnae_principal ON establishments(cnae_fiscal_principal);
CREATE INDEX idx_establishments_situacao ON establishments(situacao_cadastral);
CREATE INDEX idx_companies_porte ON companies(porte_empresa);
CREATE INDEX idx_companies_natureza ON companies(natureza_juridica);
