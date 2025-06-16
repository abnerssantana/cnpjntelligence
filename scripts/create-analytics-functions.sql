-- Function to get companies statistics by state
CREATE OR REPLACE FUNCTION get_companies_by_state_stats()
RETURNS TABLE (
  uf text,
  total bigint,
  active bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.uf,
    COUNT(*)::bigint as total,
    COUNT(CASE WHEN e.situacao_cadastral = 2 THEN 1 END)::bigint as active
  FROM empresas e
  WHERE e.uf IS NOT NULL
  GROUP BY e.uf
  ORDER BY total DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Function to get companies growth by month
CREATE OR REPLACE FUNCTION get_companies_monthly_growth(
  p_months integer DEFAULT 6,
  p_uf text DEFAULT NULL
)
RETURNS TABLE (
  month_name text,
  month_date date,
  total_companies bigint,
  new_companies bigint
) AS $$
BEGIN
  -- Since we don't have creation date in the empresas table,
  -- we'll use data_inicio_atividade as a proxy for growth analysis
  RETURN QUERY
  WITH monthly_data AS (
    SELECT 
      date_trunc('month', data_inicio_atividade::date) as month_date,
      COUNT(*) as companies_count
    FROM empresas
    WHERE data_inicio_atividade IS NOT NULL
      AND data_inicio_atividade::date >= CURRENT_DATE - INTERVAL '1 year'
      AND (p_uf IS NULL OR uf = p_uf)
    GROUP BY date_trunc('month', data_inicio_atividade::date)
  ),
  cumulative AS (
    SELECT 
      month_date,
      companies_count,
      SUM(companies_count) OVER (ORDER BY month_date) as running_total
    FROM monthly_data
  )
  SELECT 
    to_char(month_date, 'Mon') as month_name,
    month_date,
    running_total as total_companies,
    companies_count as new_companies
  FROM cumulative
  WHERE month_date >= CURRENT_DATE - (p_months || ' months')::interval
  ORDER BY month_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get top sectors (CNAEs)
CREATE OR REPLACE FUNCTION get_top_sectors(
  p_limit integer DEFAULT 10,
  p_uf text DEFAULT NULL
)
RETURNS TABLE (
  cnae_codigo integer,
  cnae_descricao text,
  total_companies bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cnae_fiscal as cnae_codigo,
    MAX(cnae_fiscal_descricao) as cnae_descricao,
    COUNT(*)::bigint as total_companies
  FROM empresas
  WHERE cnae_fiscal IS NOT NULL
    AND (p_uf IS NULL OR uf = p_uf)
  GROUP BY cnae_fiscal
  ORDER BY total_companies DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;