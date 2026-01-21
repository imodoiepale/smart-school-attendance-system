-- Add stream column to user_registry table
-- Run this in Supabase SQL Editor to add the missing column

ALTER TABLE public.user_registry 
ADD COLUMN stream text;

-- Add index for better performance
CREATE INDEX idx_user_registry_stream ON public.user_registry(stream);

-- Optional: Add comments
COMMENT ON COLUMN public.user_registry.stream IS 'Student stream/track (e.g., Science, Arts, Commerce)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_registry' AND column_name = 'stream';
