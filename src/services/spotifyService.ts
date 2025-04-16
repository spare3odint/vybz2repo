// Spotify API service for authentication and track search

interface SpotifyToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  obtained_at: number;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
  duration_ms: number;
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

class SpotifyService {
  private clientId: string = "e711c83f72674df7950b28e3d293308d";
  private clientSecret: string = "9992bf03fc1e4e62bfa1eb87d65b8b7b";
  private token: SpotifyToken | null = null;

  constructor() {
    // Check if we have a token in localStorage
    const savedToken = localStorage.getItem("spotify_token");
    if (savedToken) {
      try {
        this.token = JSON.parse(savedToken);
        // Check if token is expired
        if (this.isTokenExpired()) {
          this.token = null;
        }
      } catch (error) {
        console.error("Error parsing saved token:", error);
        this.token = null;
        localStorage.removeItem("spotify_token");
      }
    }
  }

  private isTokenExpired(): boolean {
    if (!this.token) return true;

    const now = Date.now();
    const expiresAt = this.token.obtained_at + this.token.expires_in * 1000;
    return now >= expiresAt;
  }

  async getToken(): Promise<string> {
    if (this.token && !this.isTokenExpired()) {
      return this.token.access_token;
    }

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + btoa(`${this.clientId}:${this.clientSecret}`),
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to get Spotify token: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      this.token = {
        ...data,
        obtained_at: Date.now(),
      };

      // Save token to localStorage
      localStorage.setItem("spotify_token", JSON.stringify(this.token));
      return this.token.access_token;
    } catch (error) {
      console.error("Error fetching Spotify token:", error);
      throw error;
    }
  }

  async searchTracksByMood(
    mood: string,
    limit: number = 10,
  ): Promise<SpotifyTrack[]> {
    const token = await this.getToken();

    // Map mood to search terms
    const moodSearchTerms: Record<string, string> = {
      "lonely-hopeful": "ambient melancholic hopeful",
      "chaotic-energy": "electronic upbeat energetic",
      "villain-era": "dark intense dramatic",
      "nostalgia-core": "retro nostalgic warm",
      "zen-mode": "calm meditation ambient",
      "main-character": "epic cinematic motivational",
    };

    const searchTerm = moodSearchTerms[mood] || mood;

    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchTerm)}&type=track&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to search Spotify tracks: ${response.status} ${response.statusText}`,
        );
      }

      const data: SpotifySearchResponse = await response.json();
      return data.tracks.items;
    } catch (error) {
      console.error("Error searching Spotify tracks:", error);
      throw error;
    }
  }

  // Format duration from milliseconds to MM:SS
  formatDuration(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

export type { SpotifyTrack };
export default new SpotifyService();
