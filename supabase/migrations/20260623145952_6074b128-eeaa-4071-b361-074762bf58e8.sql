DROP POLICY IF EXISTS "Public read access to branding bucket" ON storage.objects;

CREATE POLICY "Authenticated read access to branding bucket"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'branding');