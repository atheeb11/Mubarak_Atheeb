-- ========================================================
-- Supabase PostgreSQL Schema for Mubarak Atheeb Portfolio
-- Run this in your Supabase Dashboard: SQL Editor -> New Query -> Run
-- ========================================================

-- 1. Create the contact inquiries table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT DEFAULT 'General Inquiry',
    message TEXT NOT NULL,
    received_at TIMESTAMPTZ DEFAULT now(),
    ip TEXT
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow anyone (portfolio visitors) to insert contact inquiries
CREATE POLICY "Allow public submissions" 
ON public.messages 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 4. Policy: Allow reading messages
CREATE POLICY "Allow reading messages" 
ON public.messages 
FOR SELECT 
TO anon, authenticated
USING (true);

-- ========================================================
-- Completed! You can view messages in Supabase Table Editor.
-- ========================================================

