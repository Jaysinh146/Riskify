-- Create companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  contact_info TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create analysis_history table
CREATE TABLE public.analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  input_text TEXT NOT NULL,
  prediction_label TEXT NOT NULL,
  risk_score NUMERIC NOT NULL,
  risk_level TEXT NOT NULL,
  confidence NUMERIC NOT NULL,
  explanation TEXT,
  entities JSONB,
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create uploaded_files table
CREATE TABLE public.uploaded_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  analysis_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_files ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Users can view their company"
  ON public.companies FOR SELECT
  USING (id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can update their company"
  ON public.companies FOR UPDATE
  USING (id IN (SELECT company_id FROM public.profiles WHERE user_id = auth.uid() AND is_admin = true));

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Analysis history policies
CREATE POLICY "Users can view their own analysis history"
  ON public.analysis_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own analysis"
  ON public.analysis_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own analysis"
  ON public.analysis_history FOR DELETE
  USING (user_id = auth.uid());

-- Uploaded files policies
CREATE POLICY "Users can view their own files"
  ON public.uploaded_files FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own files"
  ON public.uploaded_files FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own files"
  ON public.uploaded_files FOR DELETE
  USING (user_id = auth.uid());

-- Create storage bucket for uploaded files
INSERT INTO storage.buckets (id, name, public)
VALUES ('analysis-files', 'analysis-files', false);

-- Storage policies
CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'analysis-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'analysis-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'analysis-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime for analysis_history
ALTER PUBLICATION supabase_realtime ADD TABLE public.analysis_history;