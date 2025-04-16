-- Add Jamendo track fields to vibes table if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='vibes' AND column_name='jamendo_track_id') THEN
        ALTER TABLE vibes ADD COLUMN jamendo_track_id TEXT;
    END IF;
    
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='vibes' AND column_name='jamendo_track_name') THEN
        ALTER TABLE vibes ADD COLUMN jamendo_track_name TEXT;
    END IF;
    
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='vibes' AND column_name='jamendo_track_artist') THEN
        ALTER TABLE vibes ADD COLUMN jamendo_track_artist TEXT;
    END IF;
    
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='vibes' AND column_name='jamendo_track_image_url') THEN
        ALTER TABLE vibes ADD COLUMN jamendo_track_image_url TEXT;
    END IF;
    
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='vibes' AND column_name='jamendo_track_preview_url') THEN
        ALTER TABLE vibes ADD COLUMN jamendo_track_preview_url TEXT;
    END IF;
    
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='vibes' AND column_name='jamendo_track_external_url') THEN
        ALTER TABLE vibes ADD COLUMN jamendo_track_external_url TEXT;
    END IF;
END $$;
