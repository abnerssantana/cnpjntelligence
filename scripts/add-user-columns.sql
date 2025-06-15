-- Adicionar colunas necessárias para autenticação
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Criar índice para email para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);