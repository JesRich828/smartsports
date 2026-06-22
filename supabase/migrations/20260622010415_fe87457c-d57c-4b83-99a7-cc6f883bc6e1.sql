CREATE TABLE public.organization_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_name text NOT NULL DEFAULT '',
  logo_initials text NOT NULL DEFAULT '',
  tagline text NOT NULL DEFAULT '',
  primary_color text NOT NULL DEFAULT '',
  accent_color text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_settings TO authenticated;
GRANT ALL ON public.organization_settings TO service_role;

ALTER TABLE public.organization_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users manage organization_settings"
ON public.organization_settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);