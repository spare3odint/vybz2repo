-- Add RLS policies for the vibes table

-- Enable RLS on vibes table if not already enabled
ALTER TABLE vibes ENABLE ROW LEVEL SECURITY;

-- Policy for inserting vibes (allows authenticated users to insert)
DROP POLICY IF EXISTS "Users can insert their own vibes" ON vibes;
CREATE POLICY "Users can insert their own vibes"
    ON vibes
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy for selecting vibes (allows anyone to view all vibes)
DROP POLICY IF EXISTS "Anyone can view all vibes" ON vibes;
CREATE POLICY "Anyone can view all vibes"
    ON vibes
    FOR SELECT
    USING (true);

-- Policy for updating vibes (users can only update their own vibes)
DROP POLICY IF EXISTS "Users can update their own vibes" ON vibes;
CREATE POLICY "Users can update their own vibes"
    ON vibes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for deleting vibes (users can only delete their own vibes)
DROP POLICY IF EXISTS "Users can delete their own vibes" ON vibes;
CREATE POLICY "Users can delete their own vibes"
    ON vibes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
