import os
import glob
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

# --- Função para upsert (insert/update) ---
def upsert_dataframe(df, table, conflict_cols, engine, dtype_map=None):
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

# --- Cria tabela motivos_situacao_cadastral se não existir ---
with engine.begin() as conn:
    conn.execute(text('''
        CREATE TABLE IF NOT EXISTS motivos_situacao_cadastral (
            codigo VARCHAR PRIMARY KEY,
            descricao TEXT
        );
    '''))

# --- Importa motivos.csv ---
print('Lendo motivos.csv...')
motivos_df = pd.read_csv('CNPJ_Matrix/motivos.csv', sep=';', header=None, dtype=str, names=['codigo','descricao'], quoting=3)
upsert_dataframe(motivos_df, 'motivos_situacao_cadastral', ['codigo'], engine)

# --- Cria tabela regimes_tributarios se não existir ---
with engine.begin() as conn:
    conn.execute(text('''
        CREATE TABLE IF NOT EXISTS regimes_tributarios (
            ano INTEGER,
            cnpj_completo VARCHAR(18),
            forma_tributacao TEXT,
            quantidade_escrituracoes INTEGER,
            PRIMARY KEY (ano, cnpj_completo, forma_tributacao)
        );
    '''))

# --- Função para importar arquivos de regime tributário ---
def import_regime_csv(path, forma_tributacao_padrao=None):
    print(f'Lendo {path}...')
    df = pd.read_csv(path, sep=None, engine='python', header=0, dtype=str)
    # Detecta colunas
    if df.shape[1] == 4:
        df.columns = ['ano','cnpj_completo','forma_tributacao','quantidade_escrituracoes']
    elif df.shape[1] == 3 and forma_tributacao_padrao:
        df.columns = ['ano','cnpj_completo','quantidade_escrituracoes']
        df['forma_tributacao'] = forma_tributacao_padrao
    else:
        raise Exception(f'Formato inesperado em {path}')
    # Ajusta tipos
    df['ano'] = df['ano'].astype(int)
    df['quantidade_escrituracoes'] = df['quantidade_escrituracoes'].astype(int)
    # Reordena colunas
    df = df[['ano','cnpj_completo','forma_tributacao','quantidade_escrituracoes']]
    upsert_dataframe(df, 'regimes_tributarios', ['ano','cnpj_completo','forma_tributacao'], engine)

# --- Importa arquivos de regime tributário ---
regime_files = [
    'CNPJ_Matrix/Imunes e Isentas.csv',
    'CNPJ_Matrix/Lucro Real.csv',
    'CNPJ_Matrix/Lucro Arbitrado.csv',
]
regime_files += sorted(glob.glob('CNPJ_Matrix/Lucro Presumido *.csv'))

for file in regime_files:
    if 'Imunes' in file:
        import_regime_csv(file, forma_tributacao_padrao=None)
    elif 'Lucro Real' in file:
        import_regime_csv(file, forma_tributacao_padrao='LUCRO REAL')
    elif 'Lucro Arbitrado' in file:
        import_regime_csv(file, forma_tributacao_padrao='LUCRO ARBITRADO')
    elif 'Lucro Presumido' in file:
        import_regime_csv(file, forma_tributacao_padrao='LUCRO PRESUMIDO')
    else:
        import_regime_csv(file)

print('Importação de tabelas auxiliares concluída.')
