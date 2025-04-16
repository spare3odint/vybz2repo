-- Add jamendo_track_artist column to vibes table
ALTER TABLE vibes ADD COLUMN IF NOT EXISTS jamendo_track_artist TEXT;
ALTER TABLE vibes ADD COLUMN IF NOT EXISTS jamendo_track_id TEXT;
ALTER TABLE vibes ADD COLUMN IF NOT EXISTS jamendo_track_name TEXT;
ALTER TABLE vibes ADD COLUMN IF NOT EXISTS jamendo_track_image_url TEXT;
ALTER TABLE vibes ADD COLUMN IF NOT EXISTS jamendo_track_preview_url TEXT;
ALTER TABLE vibes ADD COLUMN IF NOT EXISTS jamendo_track_external_url TEXT;

-- Update the realtime publication
alter publication supabase_realtime add table vibes;