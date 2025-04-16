// Jamendo API service for track search

interface JamendoTrack {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  image: string;
  audio: string;
  duration: number;
  position: number;
  shareurl: string;
}

interface JamendoSearchResponse {
  results: JamendoTrack[];
  headers: {
    status: string;
    code: number;
    error_message: string | null;
    results_count: number;
    total_count: number;
  };
}

class JamendoService {
  private clientId: string = "a42ecfbd";
  private apiEndpoint: string = "https://api.jamendo.com/v3.0";

  constructor() {
    console.log("Initializing Jamendo service");
  }

  async searchTracksByMood(
    mood: string,
    limit: number = 10,
  ): Promise<JamendoTrack[]> {
    // Map mood to search terms and tags
    const moodSearchTerms: Record<string, { query: string; tags: string[] }> = {
      "lonely-hopeful": {
        query: "ambient melancholic hopeful",
        tags: ["ambient", "melancholic", "calm", "atmospheric"],
      },
      "chaotic-energy": {
        query: "electronic upbeat energetic",
        tags: ["electronic", "energetic", "upbeat", "dance"],
      },
      "villain-era": {
        query: "dark intense dramatic",
        tags: ["dark", "intense", "dramatic", "cinematic"],
      },
      "nostalgia-core": {
        query: "retro nostalgic warm",
        tags: ["retro", "nostalgic", "warm", "lofi"],
      },
      "zen-mode": {
        query: "calm meditation ambient",
        tags: ["calm", "meditation", "ambient", "relaxing"],
      },
      "main-character": {
        query: "epic cinematic motivational",
        tags: ["epic", "cinematic", "motivational", "inspiring"],
      },
    };

    const searchInfo = moodSearchTerms[mood] || { query: mood, tags: [] };
    const tagsParam =
      searchInfo.tags.length > 0 ? `&tags=${searchInfo.tags.join("+")}` : "";

    try {
      console.log(`Searching for tracks with mood: ${searchInfo.query}`);

      const url = `${this.apiEndpoint}/tracks/?client_id=${this.clientId}&format=json&limit=${limit}&search=${encodeURIComponent(searchInfo.query)}${tagsParam}&include=musicinfo&boost=popularity_total`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Jamendo API error: ${response.status} ${response.statusText}`,
        );
      }

      const data: JamendoSearchResponse = await response.json();

      if (data.headers.code !== 0 && data.headers.code !== 200) {
        throw new Error(`Jamendo API error: ${data.headers.error_message}`);
      }

      return data.results;
    } catch (error) {
      console.error("Error searching Jamendo tracks:", error);
      // Return mock tracks as fallback
      return this.generateMockTracks(searchInfo.query, limit);
    }
  }

  // Generate mock tracks for development/fallback
  private generateMockTracks(
    searchTerm: string,
    limit: number,
  ): JamendoTrack[] {
    const tracks: JamendoTrack[] = [];

    // Create different mock tracks based on the search term/mood
    const moodArtists: Record<string, string[]> = {
      "ambient melancholic hopeful": [
        "Ambient Dreams",
        "Hope Horizon",
        "Melancholy Waves",
      ],
      "electronic upbeat energetic": [
        "Electric Pulse",
        "Beat Makers",
        "Energy Flow",
      ],
      "dark intense dramatic": ["Dark Matter", "Intensity", "Drama Kings"],
      "retro nostalgic warm": [
        "Retro Vibes",
        "Nostalgia Trip",
        "Warm Memories",
      ],
      "calm meditation ambient": [
        "Calm Waters",
        "Meditation Masters",
        "Ambient Sounds",
      ],
      "epic cinematic motivational": [
        "Epic Orchestra",
        "Cinema Sounds",
        "Motivation Masters",
      ],
    };

    const artists = moodArtists[searchTerm] || [
      "Artist One",
      "Artist Two",
      "Artist Three",
    ];

    for (let i = 0; i < limit; i++) {
      const artistIndex = i % artists.length;
      const trackName = `${this.capitalizeFirstLetter(searchTerm.split(" ")[0])} Track ${i + 1}`;

      tracks.push({
        id: `mock-track-${searchTerm}-${i}`,
        name: trackName,
        artist_name: artists[artistIndex],
        album_name: `${artists[artistIndex]} Album`,
        image: `https://picsum.photos/seed/${searchTerm}-${i}/300`,
        audio: `https://github.com/anars/blank-audio/raw/master/15-seconds-of-silence.mp3`,
        duration: 180 + Math.floor(Math.random() * 120),
        position: i + 1,
        shareurl: `https://www.jamendo.com/track/${i}/${trackName.toLowerCase().replace(/ /g, "-")}`,
      });
    }

    return tracks;
  }

  private capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Format duration from seconds to MM:SS
  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}

export type { JamendoTrack };
export default new JamendoService();
