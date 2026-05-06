-- Add attachment columns
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS attachment_url text,
  ADD COLUMN IF NOT EXISTS attachment_name text,
  ADD COLUMN IF NOT EXISTS attachment_type text;

-- Create public bucket for attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('announcement-attachments', 'announcement-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Public read
CREATE POLICY "Public can read announcement attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'announcement-attachments');

-- Admin upload
CREATE POLICY "Admins can upload announcement attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'announcement-attachments' AND public.has_role(auth.uid(), 'admin'));

-- Admin update
CREATE POLICY "Admins can update announcement attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'announcement-attachments' AND public.has_role(auth.uid(), 'admin'));

-- Admin delete
CREATE POLICY "Admins can delete announcement attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'announcement-attachments' AND public.has_role(auth.uid(), 'admin'));
