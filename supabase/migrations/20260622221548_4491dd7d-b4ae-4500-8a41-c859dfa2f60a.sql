CREATE POLICY "Public read access to branding bucket"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'branding');