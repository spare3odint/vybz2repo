-- Add jamendo_track_audio_url column to vibes table
DO $$ 
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='vibes' AND column_name='jamendo_track_audio_url') THEN
        ALTER TABLE vibes ADD COLUMN jamendo_track_audio_url TEXT;
    END IF;
END $$;