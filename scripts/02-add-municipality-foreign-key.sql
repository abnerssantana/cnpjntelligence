-- Add foreign key constraints between tables and reference tables
-- This migration adds the missing foreign key relationships

-- First, let's make sure we have reference data (municipalities, cnaes, legal_natures)
-- If these tables are empty, we need to populate them first

-- Add the municipality foreign key constraint
ALTER TABLE establishments 
ADD CONSTRAINT fk_establishments_municipio 
FOREIGN KEY (municipio) REFERENCES municipalities(codigo);

-- Add the CNAE foreign key constraint
ALTER TABLE establishments 
ADD CONSTRAINT fk_establishments_cnae 
FOREIGN KEY (cnae_fiscal_principal) REFERENCES cnaes(codigo);

-- Add the legal nature foreign key constraint for companies
ALTER TABLE companies 
ADD CONSTRAINT fk_companies_natureza_juridica 
FOREIGN KEY (natureza_juridica) REFERENCES legal_natures(codigo);

-- Create indexes for better performance on foreign key lookups
CREATE INDEX IF NOT EXISTS idx_establishments_municipio_fk ON establishments(municipio);
CREATE INDEX IF NOT EXISTS idx_establishments_cnae_fk ON establishments(cnae_fiscal_principal);
CREATE INDEX IF NOT EXISTS idx_companies_natureza_juridica_fk ON companies(natureza_juridica);