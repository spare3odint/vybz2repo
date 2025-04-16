-- Add text column to vibes table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vibes' AND column_name = 'text') THEN
        ALTER TABLE vibes ADD COLUMN text TEXT;
    END IF;
END $$;
