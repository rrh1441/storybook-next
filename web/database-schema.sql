-- Storybook Database Schema
-- Run this in your Supabase SQL editor

-- Create the storybooks table
CREATE TABLE public.storybooks (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    title text,
    theme text NOT NULL,
    main_character text,
    educational_focus text,
    reference_image_url text,
    hero_image_url text,
    hero_approved boolean DEFAULT false,
    hero_generation_attempts integer DEFAULT 0,
    story_approved boolean DEFAULT false,
    status text DEFAULT 'draft' NOT NULL, -- draft, generating, completed, failed
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.storybooks ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own storybooks
CREATE POLICY "Allow users to manage their own storybooks" ON public.storybooks 
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create the storybook_pages table
CREATE TABLE public.storybook_pages (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    storybook_id uuid NOT NULL REFERENCES public.storybooks(id) ON DELETE CASCADE,
    page_number integer NOT NULL,
    text text,
    image_prompt text,
    image_url text,
    image_status text DEFAULT 'pending'::text NOT NULL, -- pending, generating, completed, failed
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT storybook_pages_unique_page_number UNIQUE (storybook_id, page_number)
);

-- Enable Row Level Security
ALTER TABLE public.storybook_pages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to select/manage pages for their storybooks
CREATE POLICY "Allow users to select/manage pages for their storybooks" ON public.storybook_pages 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.storybooks sb WHERE sb.id = storybook_pages.storybook_id AND sb.user_id = auth.uid())
);

-- Create storage bucket for storybook assets (if not already exists)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('storybook-assets', 'storybook-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for storybook assets
CREATE POLICY "Allow authenticated users to upload their own assets" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'storybook-assets' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to view all storybook assets" ON storage.objects
FOR SELECT USING (bucket_id = 'storybook-assets');

CREATE POLICY "Allow users to update their own assets" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'storybook-assets' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to delete their own assets" ON storage.objects
FOR DELETE USING (
  bucket_id = 'storybook-assets' AND 
  auth.role() = 'authenticated'
);

-- Add indexes for better performance
CREATE INDEX idx_storybooks_user_id ON public.storybooks(user_id);
CREATE INDEX idx_storybooks_status ON public.storybooks(status);
CREATE INDEX idx_storybook_pages_storybook_id ON public.storybook_pages(storybook_id);
CREATE INDEX idx_storybook_pages_page_number ON public.storybook_pages(storybook_id, page_number);