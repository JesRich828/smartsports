-- Org membership is determined by a verified @smartsports.org email address.
-- Security definer so RLS policies can read auth.users without granting direct access.
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = _user_id
      AND u.email IS NOT NULL
      AND lower(u.email) LIKE '%@smartsports.org'
  )
$$;

REVOKE ALL ON FUNCTION public.is_org_member(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid) TO authenticated, service_role;

-- donors
DROP POLICY IF EXISTS "Authenticated users manage donors" ON public.donors;
CREATE POLICY "Org members manage donors" ON public.donors
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid()))
  WITH CHECK (public.is_org_member(auth.uid()));

-- grants
DROP POLICY IF EXISTS "Authenticated users manage grants" ON public.grants;
CREATE POLICY "Org members manage grants" ON public.grants
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid()))
  WITH CHECK (public.is_org_member(auth.uid()));

-- board_members
DROP POLICY IF EXISTS "Authenticated users manage board_members" ON public.board_members;
CREATE POLICY "Org members manage board_members" ON public.board_members
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid()))
  WITH CHECK (public.is_org_member(auth.uid()));

-- golf_sponsors
DROP POLICY IF EXISTS "Authenticated users manage golf_sponsors" ON public.golf_sponsors;
CREATE POLICY "Org members manage golf_sponsors" ON public.golf_sponsors
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid()))
  WITH CHECK (public.is_org_member(auth.uid()));

-- golf_foursomes
DROP POLICY IF EXISTS "Authenticated users manage golf_foursomes" ON public.golf_foursomes;
CREATE POLICY "Org members manage golf_foursomes" ON public.golf_foursomes
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid()))
  WITH CHECK (public.is_org_member(auth.uid()));

-- golf_players
DROP POLICY IF EXISTS "Authenticated users manage golf_players" ON public.golf_players;
CREATE POLICY "Org members manage golf_players" ON public.golf_players
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid()))
  WITH CHECK (public.is_org_member(auth.uid()));

-- golf_auction
DROP POLICY IF EXISTS "Authenticated users manage golf_auction" ON public.golf_auction;
CREATE POLICY "Org members manage golf_auction" ON public.golf_auction
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid()))
  WITH CHECK (public.is_org_member(auth.uid()));

-- golf_expenses
DROP POLICY IF EXISTS "Authenticated users manage golf_expenses" ON public.golf_expenses;
CREATE POLICY "Org members manage golf_expenses" ON public.golf_expenses
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid()))
  WITH CHECK (public.is_org_member(auth.uid()));

-- sponsors
DROP POLICY IF EXISTS "Authenticated staff can manage sponsors" ON public.sponsors;
CREATE POLICY "Org members manage sponsors" ON public.sponsors
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid()))
  WITH CHECK (public.is_org_member(auth.uid()));

-- goals
DROP POLICY IF EXISTS "Authenticated users manage goals" ON public.goals;
CREATE POLICY "Org members manage goals" ON public.goals
  FOR ALL TO authenticated
  USING (public.is_org_member(auth.uid()))
  WITH CHECK (public.is_org_member(auth.uid()));