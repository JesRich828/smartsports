-- Open data access from org-only to any authenticated user
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'donors','grants','board_members','golf_sponsors','golf_foursomes',
    'golf_players','golf_auction','golf_expenses','sponsors','goals'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'Org members manage ' || t, t);
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      'Authenticated users manage ' || t, t
    );
  END LOOP;
END $$;