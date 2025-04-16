import { supabase } from "./supabaseClient";

export interface VibeData {
  id?: string;
  user_id?: string;
  mood: string;
  audio_url?: string;
  visual_url?: string;
  caption?: string;
  tags?: string[];
  spotify_track_id?: string;
  spotify_track_name?: string;
  spotify_track_artist?: string;
  spotify_track_image_url?: string;
  spotify_track_preview_url?: string;
  spotify_track_external_url?: string;
  jamendo_track_id?: string;
  jamendo_track_name?: string;
  jamendo_track_artist?: string;
  jamendo_track_image_url?: string;
  jamendo_track_preview_url?: string;
  jamendo_track_external_url?: string;
  sound_layers?: string[];
  visual_filters?: string[];
  created_at?: string;
}

export const vibeService = {
  // Save a new vibe to the database
  saveVibe: async (vibeData: VibeData): Promise<VibeData> => {
    const { data, error } = await supabase
      .from("vibes")
      .insert([vibeData])
      .select();

    if (error) {
      console.error("Error saving vibe:", error);
      throw new Error(error.message);
    }

    return data?.[0] as VibeData;
  },

  // Get all vibes
  getAllVibes: async (): Promise<VibeData[]> => {
    const { data, error } = await supabase
      .from("vibes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching vibes:", error);
      throw new Error(error.message);
    }

    return data as VibeData[];
  },

  // Get vibes by mood
  getVibesByMood: async (mood: string): Promise<VibeData[]> => {
    const { data, error } = await supabase
      .from("vibes")
      .select("*")
      .eq("mood", mood)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching vibes by mood:", error);
      throw new Error(error.message);
    }

    return data as VibeData[];
  },

  // Get vibes by user ID
  getVibesByUser: async (userId: string): Promise<VibeData[]> => {
    const { data, error } = await supabase
      .from("vibes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching vibes by user:", error);
      throw new Error(error.message);
    }

    return data as VibeData[];
  },

  // Get a single vibe by ID
  getVibeById: async (id: string): Promise<VibeData | null> => {
    const { data, error } = await supabase
      .from("vibes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching vibe by ID:", error);
      throw new Error(error.message);
    }

    return data as VibeData;
  },
};
