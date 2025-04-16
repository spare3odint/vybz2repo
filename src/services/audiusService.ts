// Audius API service for track search

interface AudiusTrack {
  id: string;
  title: string;
  user: {
    name: string;
    handle: string;
  };
  artwork: {
    "150x150": string;
    "480x480": string;
    "1000x1000": string;
  };
  duration: number;
  streamUrl?: string;
  permalink: string;
}

interface AudiusSearchResponse {
  data: AudiusTrack[];
}

class AudiusService {
  // Use the official Audius API endpoints
  private apiEndpoint: string = "https://discoveryprovider.audius.co/v1";
  private appName: string = "VYBZ";

  constructor() {
    console.log("Initializing Audius service");
  }

  async searchTracksByMood(
    mood: string,
    limit: number = 10,
  ): Promise<AudiusTrack[]> {
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
      // Create mock data for development since the API is unreliable
      console.log(`Searching for tracks with mood: ${searchTerm}`);

      // Generate mock tracks based on the mood
      const mockTracks = this.generateMockTracks(searchTerm, limit);
      return mockTracks;
    } catch (error) {
      console.error("Error searching tracks:", error);
      throw error;
    }
  }

  // Generate mock tracks for development
  private generateMockTracks(searchTerm: string, limit: number): AudiusTrack[] {
    const tracks: AudiusTrack[] = [];

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
      tracks.push({
        id: `mock-track-${searchTerm}-${i}`,
        title: `${this.capitalizeFirstLetter(searchTerm.split(" ")[0])} Track ${i + 1}`,
        user: {
          name: artists[artistIndex],
          handle: artists[artistIndex].toLowerCase().replace(/ /g, "_"),
        },
        artwork: {
          "150x150": `https://picsum.photos/seed/${searchTerm}-${i}/150`,
          "480x480": `https://picsum.photos/seed/${searchTerm}-${i}/480`,
          "1000x1000": `https://picsum.photos/seed/${searchTerm}-${i}/1000`,
        },
        duration: 180 + Math.floor(Math.random() * 120),
        // Using GitHub-hosted MP3 files that allow direct access
        streamUrl: `https://github.com/anars/blank-audio/raw/master/15-seconds-of-silence.mp3`,
        permalink: `https://audius.co/track/${searchTerm}-${i}`,
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

export type { AudiusTrack };
export default new AudiusService();
