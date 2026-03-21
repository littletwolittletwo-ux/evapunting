-- Add kyc_document_url column to user_profiles
DO $$ BEGIN
  ALTER TABLE public.user_profiles ADD COLUMN kyc_document_url TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Create kyc-documents storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for kyc-documents
CREATE POLICY "Users can upload kyc docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can view own kyc docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Admins can view all kyc docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kyc-documents'
    AND EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = true)
  );
