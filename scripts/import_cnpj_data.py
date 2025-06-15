import os
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Carrega variáveis do .env.local
load_dotenv('.env.local')

DB_USER = os.getenv('DB_USER')
DB_PASS = os.getenv('DB_PASS')
DB_HOST = os.getenv('DB_HOST')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME')

DATABASE_URL = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
engine = create_engine(DATABASE_URL)

# --- Limite de linhas para testes iniciais ---
LIMIT_ROWS = 100  # Defina como None para importar tudo

# --- Função para upsert (insert/update) ---
def upsert_dataframe(df, table, conflict_cols, engine, dtype_map=None):
    # Cria uma tabela temporária
    temp_table = f"temp_{table}"
    df.to_sql(temp_table, engine, if_exists='replace', index=False, dtype=dtype_map)
    cols = ','.join(df.columns)
    updates = ','.join([f"{col}=EXCLUDED.{col}" for col in df.columns if col not in conflict_cols])
    conflict = ','.join(conflict_cols)
    with engine.begin() as conn:
        sql = text(f'''
            INSERT INTO {table} ({cols})
            SELECT {cols} FROM {temp_table}
            ON CONFLICT ({conflict}) DO UPDATE SET {updates};
            DROP TABLE {temp_table};
        ''')
        conn.execute(sql)

# --- Importa base.csv para companies e establishments ---
print('Lendo base.csv...')
base_path = 'CNPJ_Matrix/base.csv'
base_cols = [
    'cnpj_basico', 'cnpj_ordem', 'cnpj_dv', 'identificador_matriz_filial', 'nome_fantasia',
    'situacao_cadastral', 'data_situacao_cadastral', 'motivo_situacao_cadastral', 'nome_cidade_exterior',
    'pais', 'data_inicio_atividade', 'cnae_fiscal_principal', 'cnae_fiscal_secundaria', 'tipo_logradouro',
    'logradouro', 'numero', 'complemento', 'bairro', 'cep', 'uf', 'municipio', 'ddd1', 'telefone1',
    'ddd2', 'telefone2', 'ddd_fax', 'fax', 'correio_eletronico', 'situacao_especial', 'data_situacao_especial'
]
# Adapta para o número de colunas do arquivo
base_df = pd.read_csv(base_path, sep=';', header=None, dtype=str, names=base_cols, quoting=3, nrows=LIMIT_ROWS, encoding='latin1', on_bad_lines='skip')

# Companies: apenas cnpj_basico
companies_df = base_df[['cnpj_basico']].drop_duplicates()
upsert_dataframe(companies_df, 'companies', ['cnpj_basico'], engine)

# Establishments: todos os campos
upsert_dataframe(base_df, 'establishments', ['cnpj_basico','cnpj_ordem','cnpj_dv'], engine)

# --- Importa cnaes.csv ---
print('Lendo cnaes.csv...')
cnaes_df = pd.read_csv('CNPJ_Matrix/cnaes.csv', sep=';', header=None, dtype=str, names=['codigo','descricao'], quoting=3)
upsert_dataframe(cnaes_df, 'cnaes', ['codigo'], engine)

# --- Importa municipios.csv ---
print('Lendo municipios.csv...')
municipios_df = pd.read_csv('CNPJ_Matrix/municipios.csv', sep=';', header=None, dtype=str, names=['codigo','descricao'], quoting=3)
upsert_dataframe(municipios_df, 'municipalities', ['codigo'], engine)

# --- Importa naturezas.csv ---
print('Lendo naturezas.csv...')
naturezas_df = pd.read_csv('CNPJ_Matrix/naturezas.csv', sep=';', header=None, dtype=str, names=['codigo','descricao'], quoting=3)
upsert_dataframe(naturezas_df, 'legal_natures', ['codigo'], engine)

print('Importação concluída.')
