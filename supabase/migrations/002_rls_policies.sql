-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- COMPANIES POLICIES
-- ============================================================
CREATE POLICY "Users can view their own company"
  ON companies FOR SELECT
  USING (id = get_user_company_id());

CREATE POLICY "Admins can update their company"
  ON companies FOR UPDATE
  USING (id = get_user_company_id() AND get_user_role() = 'Admin');

CREATE POLICY "Allow company creation during signup"
  ON companies FOR INSERT
  WITH CHECK (TRUE);

-- ============================================================
-- PROFILES POLICIES
-- ============================================================
CREATE POLICY "Users can view profiles in same company"
  ON profiles FOR SELECT
  USING (company_id = get_user_company_id() OR id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "Allow profile insert on signup"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage team profiles"
  ON profiles FOR ALL
  USING (
    get_user_role() = 'Admin'
    AND company_id = get_user_company_id()
  );

-- ============================================================
-- CONTACTS POLICIES
-- ============================================================
CREATE POLICY "Company members can view contacts"
  ON contacts FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Company members can create contacts"
  ON contacts FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company members can update contacts"
  ON contacts FOR UPDATE
  USING (company_id = get_user_company_id());

CREATE POLICY "Admins and Managers can delete contacts"
  ON contacts FOR DELETE
  USING (
    company_id = get_user_company_id()
    AND get_user_role() IN ('Admin', 'Manager')
  );

-- ============================================================
-- LEADS POLICIES
-- ============================================================
CREATE POLICY "Company members can view leads"
  ON leads FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Company members can create leads"
  ON leads FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Authorized members can update leads"
  ON leads FOR UPDATE
  USING (
    company_id = get_user_company_id()
    AND (
      get_user_role() IN ('Admin', 'Manager')
      OR assigned_to = auth.uid()
    )
  );

CREATE POLICY "Admins and Managers can delete leads"
  ON leads FOR DELETE
  USING (
    company_id = get_user_company_id()
    AND get_user_role() IN ('Admin', 'Manager')
  );

-- ============================================================
-- ACTIVITIES POLICIES
-- ============================================================
CREATE POLICY "Company members can view activities"
  ON activities FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Company members can create activities"
  ON activities FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Creators and managers can update activities"
  ON activities FOR UPDATE
  USING (
    company_id = get_user_company_id()
    AND (
      get_user_role() IN ('Admin', 'Manager')
      OR created_by = auth.uid()
    )
  );

CREATE POLICY "Creators and managers can delete activities"
  ON activities FOR DELETE
  USING (
    company_id = get_user_company_id()
    AND (
      get_user_role() IN ('Admin', 'Manager')
      OR created_by = auth.uid()
    )
  );

-- ============================================================
-- INVOICES POLICIES
-- ============================================================
CREATE POLICY "Company members can view invoices"
  ON invoices FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Company members can create invoices"
  ON invoices FOR INSERT
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "Company members can update invoices"
  ON invoices FOR UPDATE
  USING (company_id = get_user_company_id());

CREATE POLICY "Admins and Managers can delete invoices"
  ON invoices FOR DELETE
  USING (
    company_id = get_user_company_id()
    AND get_user_role() IN ('Admin', 'Manager')
  );

-- ============================================================
-- AI CONVERSATIONS POLICIES
-- ============================================================
CREATE POLICY "Users can manage their own conversations"
  ON ai_conversations FOR ALL
  USING (
    user_id = auth.uid()
    AND company_id = get_user_company_id()
  );

-- ============================================================
-- AUDIT LOGS POLICIES
-- ============================================================
CREATE POLICY "Company members can view audit logs"
  ON audit_logs FOR SELECT
  USING (company_id = get_user_company_id());

CREATE POLICY "Allow audit log inserts from service role"
  ON audit_logs FOR INSERT
  WITH CHECK (TRUE);
