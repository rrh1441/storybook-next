-- Migration to unify storybooks and orders tables
-- This migration links orders to users and consolidates the data model

-- Step 1: Add user_id column to orders table (nullable initially)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 2: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);

-- Step 3: Enable Row Level Security on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies for orders table
-- Policy for users to see their own orders
CREATE POLICY "Users can view their own orders" ON public.orders 
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- Policy for users to create orders (both authenticated and anonymous)
CREATE POLICY "Anyone can create orders" ON public.orders 
FOR INSERT WITH CHECK (true);

-- Policy for users to update their own orders
CREATE POLICY "Users can update their own orders" ON public.orders 
FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Step 5: Add missing columns to orders table to match storybooks functionality
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS main_character text,
ADD COLUMN IF NOT EXISTS educational_focus text,
ADD COLUMN IF NOT EXISTS reference_image_url text,
ADD COLUMN IF NOT EXISTS hero_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS story_approved boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pages jsonb DEFAULT '[]'::jsonb;

-- Step 6: Create a view to unify orders and storybooks for backward compatibility
CREATE OR REPLACE VIEW public.user_storybooks AS
SELECT 
    o.id,
    o.user_id,
    COALESCE(o.title, 'Untitled Story') as title,
    o.theme->>'name' as theme,
    o.main_character,
    o.educational_focus,
    o.reference_image_url,
    o.hero_image_url,
    o.hero_approved,
    o.story_approved,
    o.status,
    o.created_at,
    o.updated_at,
    o.email,
    o.child_descriptor,
    o.story_idea,
    o.preview_pages,
    o.full_story,
    o.progress,
    o.pdf_url,
    o.stripe_session_id,
    o.stripe_payment_intent_id,
    o.pages
FROM public.orders o
WHERE o.user_id IS NOT NULL
ORDER BY o.created_at DESC;

-- Step 7: Grant permissions on the view
GRANT SELECT ON public.user_storybooks TO authenticated;

-- Step 8: Add trigger to auto-populate user_id for authenticated users
CREATE OR REPLACE FUNCTION public.set_order_user_id()
RETURNS trigger AS $$
BEGIN
    -- If user is authenticated and user_id is not set, set it
    IF auth.uid() IS NOT NULL AND NEW.user_id IS NULL THEN
        NEW.user_id := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS set_order_user_id_trigger ON public.orders;
CREATE TRIGGER set_order_user_id_trigger
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.set_order_user_id();

-- Step 9: Update the status values to be consistent
-- Map storybook statuses to order statuses
UPDATE public.orders 
SET status = CASE 
    WHEN status = 'draft' THEN 'pending'
    WHEN status = 'generating' THEN 'generating_preview'
    WHEN status = 'completed' THEN 'completed'
    WHEN status = 'failed' THEN 'failed'
    ELSE status
END
WHERE status IN ('draft', 'generating', 'completed', 'failed');