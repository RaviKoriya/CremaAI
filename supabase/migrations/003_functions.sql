-- ============================================================
-- INVOICE NUMBER GENERATOR (atomic, no duplicates)
-- ============================================================
CREATE OR REPLACE FUNCTION generate_invoice_number(p_company_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_count  INTEGER;
BEGIN
  SELECT invoice_prefix INTO v_prefix
  FROM companies WHERE id = p_company_id;

  SELECT COUNT(*) + 1 INTO v_count
  FROM invoices WHERE company_id = p_company_id;

  RETURN v_prefix || '-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- DASHBOARD STATS
-- ============================================================
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_company_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_leads',       COUNT(*),
    'pipeline_value',    COALESCE(SUM(value) FILTER (WHERE status NOT IN ('Won','Lost')), 0),
    'won_this_month',    COUNT(*) FILTER (
                           WHERE status = 'Won'
                           AND DATE_TRUNC('month', updated_at) = DATE_TRUNC('month', NOW())
                         ),
    'won_value_month',   COALESCE(SUM(value) FILTER (
                           WHERE status = 'Won'
                           AND DATE_TRUNC('month', updated_at) = DATE_TRUNC('month', NOW())
                         ), 0),
    'open_leads',        COUNT(*) FILTER (WHERE status NOT IN ('Won','Lost')),
    'overdue_invoices',  (
                           SELECT COUNT(*) FROM invoices
                           WHERE company_id = p_company_id
                           AND status = 'Overdue'
                         ),
    'overdue_amount',    (
                           SELECT COALESCE(SUM(total),0) FROM invoices
                           WHERE company_id = p_company_id
                           AND status = 'Overdue'
                         ),
    'win_rate',          ROUND(
                           COUNT(*) FILTER (WHERE status = 'Won')::NUMERIC /
                           NULLIF(COUNT(*) FILTER (WHERE status IN ('Won','Lost')), 0) * 100, 1
                         )
  )
  INTO result
  FROM leads
  WHERE company_id = p_company_id;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- PIPELINE FUNNEL
-- ============================================================
CREATE OR REPLACE FUNCTION get_pipeline_funnel(p_company_id UUID)
RETURNS TABLE(status TEXT, lead_count BIGINT, total_value NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.status,
    COUNT(*)::BIGINT,
    COALESCE(SUM(l.value), 0)
  FROM leads l
  WHERE l.company_id = p_company_id
  GROUP BY l.status
  ORDER BY
    ARRAY_POSITION(
      ARRAY['New','Contacted','Qualified','Proposal Sent','Negotiation','Won','Lost'],
      l.status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- GLOBAL SEARCH
-- ============================================================
CREATE OR REPLACE FUNCTION global_search(p_company_id UUID, p_query TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'leads', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', id,
          'title', title,
          'status', status,
          'value', value,
          'currency', currency,
          'type', 'lead'
        )
      ), '[]'::jsonb)
      FROM leads
      WHERE company_id = p_company_id
        AND (
          title ILIKE '%' || p_query || '%'
          OR title % p_query
        )
      LIMIT 5
    ),
    'contacts', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', id,
          'full_name', full_name,
          'email', email,
          'company_name', company_name,
          'type', 'contact'
        )
      ), '[]'::jsonb)
      FROM contacts
      WHERE company_id = p_company_id
        AND (
          full_name ILIKE '%' || p_query || '%'
          OR email ILIKE '%' || p_query || '%'
          OR company_name ILIKE '%' || p_query || '%'
        )
      LIMIT 5
    ),
    'invoices', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', id,
          'invoice_number', invoice_number,
          'total', total,
          'status', status,
          'currency', currency,
          'type', 'invoice'
        )
      ), '[]'::jsonb)
      FROM invoices
      WHERE company_id = p_company_id
        AND invoice_number ILIKE '%' || p_query || '%'
      LIMIT 5
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- REVENUE BY MONTH (for reports)
-- ============================================================
CREATE OR REPLACE FUNCTION get_revenue_by_month(p_company_id UUID, p_months INTEGER DEFAULT 12)
RETURNS TABLE(month TEXT, won_value NUMERIC, invoice_paid NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    TO_CHAR(month_series, 'Mon YYYY') AS month,
    COALESCE((
      SELECT SUM(l.value)
      FROM leads l
      WHERE l.company_id = p_company_id
        AND l.status = 'Won'
        AND DATE_TRUNC('month', l.updated_at) = month_series
    ), 0) AS won_value,
    COALESCE((
      SELECT SUM(i.total)
      FROM invoices i
      WHERE i.company_id = p_company_id
        AND i.status = 'Paid'
        AND DATE_TRUNC('month', i.issue_date::TIMESTAMPTZ) = month_series
    ), 0) AS invoice_paid
  FROM generate_series(
    DATE_TRUNC('month', NOW() - (p_months - 1 || ' months')::INTERVAL),
    DATE_TRUNC('month', NOW()),
    '1 month'::INTERVAL
  ) AS month_series
  ORDER BY month_series;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- WIN RATE BY USER (for reports)
-- ============================================================
CREATE OR REPLACE FUNCTION get_win_rate_by_user(p_company_id UUID)
RETURNS TABLE(user_id UUID, user_name TEXT, total BIGINT, won BIGINT, win_rate NUMERIC) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    COUNT(l.id)::BIGINT AS total,
    COUNT(l.id) FILTER (WHERE l.status = 'Won')::BIGINT AS won,
    ROUND(
      COUNT(l.id) FILTER (WHERE l.status = 'Won')::NUMERIC /
      NULLIF(COUNT(l.id) FILTER (WHERE l.status IN ('Won','Lost')), 0) * 100, 1
    ) AS win_rate
  FROM profiles p
  LEFT JOIN leads l ON l.assigned_to = p.id AND l.company_id = p_company_id
  WHERE p.company_id = p_company_id
  GROUP BY p.id, p.name
  ORDER BY win_rate DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- DEMO DATA LOADER (called during onboarding)
-- ============================================================
CREATE OR REPLACE FUNCTION load_demo_data(p_company_id UUID, p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_contact1 UUID;
  v_contact2 UUID;
  v_contact3 UUID;
BEGIN
  -- Insert demo contacts
  INSERT INTO contacts (company_id, full_name, email, phone, company_name, country, source, tags)
  VALUES
    (p_company_id, 'Alice Johnson', 'alice@techcorp.com', '+1-555-0101', 'TechCorp Inc.', 'US', 'LinkedIn', ARRAY['enterprise','priority'])
  RETURNING id INTO v_contact1;

  INSERT INTO contacts (company_id, full_name, email, phone, company_name, country, source, tags)
  VALUES
    (p_company_id, 'Bob Smith', 'bob@growfast.io', '+44-20-7946-0001', 'GrowFast Ltd.', 'GB', 'Referral', ARRAY['smb'])
  RETURNING id INTO v_contact2;

  INSERT INTO contacts (company_id, full_name, email, phone, company_name, country, source, tags)
  VALUES
    (p_company_id, 'Priya Sharma', 'priya@startupx.in', '+91-98765-43210', 'StartupX', 'IN', 'Web', ARRAY['startup'])
  RETURNING id INTO v_contact3;

  -- Insert demo leads
  INSERT INTO leads (company_id, contact_id, title, value, currency, status, priority, assigned_to, expected_close_date, source)
  VALUES
    (p_company_id, v_contact1, 'TechCorp Enterprise License', 45000, 'USD', 'Qualified', 'High', p_user_id, CURRENT_DATE + 30, 'LinkedIn'),
    (p_company_id, v_contact2, 'GrowFast SaaS Subscription', 12000, 'GBP', 'Proposal Sent', 'Medium', p_user_id, CURRENT_DATE + 15, 'Referral'),
    (p_company_id, v_contact3, 'StartupX Web Development', 500000, 'INR', 'Contacted', 'High', p_user_id, CURRENT_DATE + 45, 'Web'),
    (p_company_id, v_contact1, 'TechCorp Support Contract', 8000, 'USD', 'Negotiation', 'Medium', p_user_id, CURRENT_DATE + 7, 'LinkedIn'),
    (p_company_id, v_contact2, 'GrowFast Analytics Add-on', 3500, 'GBP', 'New', 'Low', p_user_id, CURRENT_DATE + 60, 'Referral');

  -- Insert demo activities
  INSERT INTO activities (company_id, contact_id, type, description, completed, created_by)
  SELECT
    p_company_id, v_contact1, 'Call', 'Initial discovery call — interested in enterprise plan', TRUE, p_user_id
  UNION ALL
  SELECT
    p_company_id, v_contact2, 'Email', 'Sent proposal document for review', TRUE, p_user_id
  UNION ALL
  SELECT
    p_company_id, v_contact3, 'Meeting', 'Product demo scheduled for next week', FALSE, p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
