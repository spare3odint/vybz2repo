import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  Image,
  Play,
  Pause,
  X,
  Upload,
  Send,
  Music,
  Scissors,
  Layers,
  Wand2,
  Search,
  Loader2,
  ExternalLink,
  Volume2,
} from "lucide-react";
import spotifyService, { SpotifyTrack } from "../services/spotifyService";
import { useReactMediaRecorder } from "react-media-recorder";
import Webcam from "react-webcam";

interface VibeCreatorProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (vibeData: VibeData) => void;
}

interface VibeData {
  mood: string;
  audio: File | null;
  audioBlob?: Blob | null;
  audioEffects?: string[];
  soundLayers?: string[];
  backgroundMusic?: string;
  spotifyTrack?: {
    id: string;
    name: string;
    artist: string;
    imageUrl: string;
    previewUrl: string | null;
    externalUrl: string;
    volume?: number;
  };
  visual: File | null;
  visualFilters?: string[];
  tags: string[];
  caption: string;
  combinedAudio?: Blob | null;
  userAudioVolume?: number;
}

const moodCategories = [
  {
    id: "lonely-hopeful",
    name: "Lonely but Hopeful",
    color: "from-blue-400 to-purple-500",
  },
  {
    id: "chaotic-energy",
    name: "Chaotic Energy",
    color: "from-red-500 to-yellow-500",
  },
  { id: "villain-era", name: "Villain Era", color: "from-black to-purple-900" },
  {
    id: "nostalgia-core",
    name: "Nostalgia Core",
    color: "from-amber-200 to-pink-300",
  },
  { id: "zen-mode", name: "Zen Mode", color: "from-teal-300 to-blue-300" },
  {
    id: "main-character",
    name: "Main Character",
    color: "from-orange-400 to-pink-500",
  },
];

const VibeCreator: React.FC<VibeCreatorProps> = ({
  open = false,
  onOpenChange = () => {},
  onSubmit = () => {},
}) => {
  const [activeTab, setActiveTab] = useState("mood");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [selectedBackgroundMusic, setSelectedBackgroundMusic] = useState<
    string | null
  >(null);
  const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrack[]>([]);
  const [selectedSpotifyTrack, setSelectedSpotifyTrack] =
    useState<SpotifyTrack | null>(null);
  const [isLoadingSpotifyTracks, setIsLoadingSpotifyTracks] = useState(false);
  const [spotifySearchQuery, setSpotifySearchQuery] = useState("");
  const [spotifyPreviewPlaying, setSpotifyPreviewPlaying] = useState<
    string | null
  >(null);
  const spotifyPreviewRef = useRef<HTMLAudioElement | null>(null);

  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      audio: true,
      onStop: (blobUrl, blob) => {
        setAudioURL(blobUrl);
        setAudioBlob(blob);
        // Convert blob to File for compatibility with existing code
        const file = new File([blob], `recording-${Date.now()}.wav`, {
          type: "audio/wav",
        });
        setAudioFile(file);
        setRecordingTime(0);

        // If we already have a Spotify track selected, combine the audio
        if (selectedSpotifyTrack?.preview_url) {
          combineAudioWithSpotify(blob, selectedSpotifyTrack.preview_url);
        }
      },
    });
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingMaxTime, setRecordingMaxTime] = useState(30); // Max 30 seconds
  const [visualFile, setVisualFile] = useState<File | null>(null);
  const [visualPreview, setVisualPreview] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [combinedAudioBlob, setCombinedAudioBlob] = useState<Blob | null>(null);
  const [combinedAudioURL, setCombinedAudioURL] = useState<string | null>(null);
  const [isCombiningAudio, setIsCombiningAudio] = useState(false);
  const [userAudioVolume, setUserAudioVolume] = useState(80);
  const [spotifyAudioVolume, setSpotifyAudioVolume] = useState(50);
  const [showVolumeControls, setShowVolumeControls] = useState(false);
  const [caption, setCaption] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [showWebcam, setShowWebcam] = useState(false);
  const [selectedSoundLayers, setSelectedSoundLayers] = useState<string[]>([]);
  const [selectedVisualFilters, setSelectedVisualFilters] = useState<string[]>(
    [],
  );

  // Refs
  const webcamRef = useRef<Webcam | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    // Load Spotify tracks based on the selected mood
    loadSpotifyTracksByMood(moodId);
  };

  const loadSpotifyTracksByMood = async (moodId: string) => {
    try {
      setIsLoadingSpotifyTracks(true);
      const tracks = await spotifyService.searchTracksByMood(moodId);
      setSpotifyTracks(tracks);
    } catch (error) {
      console.error("Error loading Spotify tracks:", error);
    } finally {
      setIsLoadingSpotifyTracks(false);
    }
  };

  const handleSpotifySearch = async () => {
    if (!spotifySearchQuery.trim()) return;

    try {
      setIsLoadingSpotifyTracks(true);
      const tracks =
        await spotifyService.searchTracksByMood(spotifySearchQuery);
      setSpotifyTracks(tracks);
    } catch (error) {
      console.error("Error searching Spotify tracks:", error);
    } finally {
      setIsLoadingSpotifyTracks(false);
    }
  };

  const handleSelectSpotifyTrack = (track: SpotifyTrack) => {
    setSelectedSpotifyTrack(track);
    // If we have both audio and a Spotify track, we should combine them
    if (audioBlob && track.preview_url) {
      combineAudioWithSpotify(audioBlob, track.preview_url);
    }
  };

  const toggleSpotifyPreview = (trackId: string, previewUrl: string | null) => {
    if (!previewUrl) return;

    if (spotifyPreviewPlaying === trackId) {
      // Stop playing
      if (spotifyPreviewRef.current) {
        spotifyPreviewRef.current.pause();
        spotifyPreviewRef.current = null;
      }
      setSpotifyPreviewPlaying(null);
    } else {
      // Start playing
      if (spotifyPreviewRef.current) {
        spotifyPreviewRef.current.pause();
      }

      spotifyPreviewRef.current = new Audio(previewUrl);
      spotifyPreviewRef.current.play();
      spotifyPreviewRef.current.onended = () => {
        setSpotifyPreviewPlaying(null);
      };
      setSpotifyPreviewPlaying(trackId);
    }
  };

  const handleNextStep = () => {
    if (activeTab === "mood" && selectedMood) {
      setActiveTab("create");
    }
  };

  const handlePreviousStep = () => {
    if (activeTab === "create") {
      setActiveTab("mood");
    }
  };

  // Sound layer options based on mood
  const getMoodSoundLayers = (moodId: string) => {
    switch (moodId) {
      case "lonely-hopeful":
        return ["ambient-pad", "soft-piano", "rain-background"];
      case "chaotic-energy":
        return ["glitch-beats", "distortion", "fast-synth"];
      case "villain-era":
        return ["dark-bass", "suspense", "cinematic"];
      case "nostalgia-core":
        return ["vinyl-crackle", "retro-synth", "tape-echo"];
      case "zen-mode":
        return ["nature-sounds", "meditation-bells", "slow-pad"];
      case "main-character":
        return ["epic-drums", "motivational", "uplifting"];
      default:
        return [];
    }
  };

  // Background music options based on mood
  const getMoodBackgroundMusic = (moodId: string) => {
    switch (moodId) {
      case "lonely-hopeful":
        return [
          {
            id: "hopeful-piano",
            name: "Hopeful Piano",
            artist: "Ambient Works",
          },
          { id: "night-sky", name: "Night Sky", artist: "Lunar Sounds" },
          {
            id: "distant-memory",
            name: "Distant Memory",
            artist: "Echo Chamber",
          },
        ];
      case "chaotic-energy":
        return [
          {
            id: "electric-pulse",
            name: "Electric Pulse",
            artist: "Neon Beats",
          },
          { id: "hyper-drive", name: "Hyper Drive", artist: "Future Shock" },
          { id: "glitch-core", name: "Glitch Core", artist: "Digital Noise" },
        ];
      case "villain-era":
        return [
          {
            id: "dark-intentions",
            name: "Dark Intentions",
            artist: "Shadow Play",
          },
          { id: "power-move", name: "Power Move", artist: "Villain Suite" },
          {
            id: "sinister-plot",
            name: "Sinister Plot",
            artist: "Midnight Scheme",
          },
        ];
      case "nostalgia-core":
        return [
          { id: "vhs-memories", name: "VHS Memories", artist: "Retro Wave" },
          {
            id: "childhood-dreams",
            name: "Childhood Dreams",
            artist: "Time Machine",
          },
          {
            id: "analog-days",
            name: "Analog Days",
            artist: "Cassette Culture",
          },
        ];
      case "zen-mode":
        return [
          {
            id: "forest-meditation",
            name: "Forest Meditation",
            artist: "Nature Sounds",
          },
          { id: "ocean-waves", name: "Ocean Waves", artist: "Calm Waters" },
          { id: "mountain-air", name: "Mountain Air", artist: "High Altitude" },
        ];
      case "main-character":
        return [
          { id: "hero-theme", name: "Hero Theme", artist: "Protagonist" },
          { id: "epic-journey", name: "Epic Journey", artist: "Main Story" },
          { id: "triumph", name: "Triumph", artist: "Victory Lap" },
        ];
      default:
        return [];
    }
  };

  // Visual filter options based on mood
  const getMoodVisualFilters = (moodId: string) => {
    switch (moodId) {
      case "lonely-hopeful":
        return ["blue-tint", "soft-focus", "light-leak"];
      case "chaotic-energy":
        return ["glitch", "high-contrast", "rgb-split"];
      case "villain-era":
        return ["dark-vignette", "desaturated", "film-grain"];
      case "nostalgia-core":
        return ["vhs", "sepia", "polaroid"];
      case "zen-mode":
        return ["pastel", "blur", "soft-light"];
      case "main-character":
        return ["cinematic", "warm", "anamorphic"];
      default:
        return [];
    }
  };

  // Simple audio player setup
  useEffect(() => {
    // Prioritize combined audio if available, otherwise use the original audio
    const sourceURL = combinedAudioURL || audioURL;

    if (sourceURL) {
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio(sourceURL);
        audioPlayerRef.current.onended = () => setIsPlaying(false);
      } else {
        audioPlayerRef.current.src = sourceURL;
      }

      // Apply volume based on what's playing
      if (audioPlayerRef.current) {
        if (combinedAudioURL) {
          // For combined audio (in a real implementation, this would be handled differently)
          audioPlayerRef.current.volume = spotifyAudioVolume / 100;
        } else {
          // For user's audio only
          audioPlayerRef.current.volume = userAudioVolume / 100;
        }
      }

      return () => {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }
      };
    }
  }, [audioURL, combinedAudioURL, userAudioVolume, spotifyAudioVolume]);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= recordingMaxTime) {
            toggleRecording();
            return recordingMaxTime;
          }
          return prev + 1;
        });
      }, 1000);
    } else if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording, recordingMaxTime]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsRecording(!isRecording);
  };

  // Recording status is now handled by the useReactMediaRecorder hook

  // Function to combine user audio with Spotify track
  const combineAudioWithSpotify = async (
    userAudioBlob: Blob,
    spotifyPreviewUrl: string,
    userVolume = userAudioVolume,
    spotifyVolume = spotifyAudioVolume,
    shouldShowControls = true,
  ) => {
    try {
      setIsCombiningAudio(true);

      // Show volume controls if this is the first time combining
      if (shouldShowControls) {
        setShowVolumeControls(true);
      }

      // For a real implementation, we would use Web Audio API to mix the tracks with proper volume levels
      // For now, we'll just use the Spotify preview as the combined audio
      const response = await fetch(spotifyPreviewUrl);
      const spotifyBlob = await response.blob();

      // Create a new combined audio blob (in a real implementation, this would be a mix with proper volume levels)
      // For now, we're just using the Spotify track
      setCombinedAudioBlob(spotifyBlob);

      // Create a URL for the combined audio
      const combinedURL = URL.createObjectURL(spotifyBlob);
      setCombinedAudioURL(combinedURL);

      // Update the audio player to use the combined audio
      if (audioPlayerRef.current) {
        audioPlayerRef.current.src = combinedURL;
        // Apply volume level (this is a simplified approach)
        audioPlayerRef.current.volume = spotifyVolume / 100;
      }
    } catch (error) {
      console.error("Error combining audio:", error);
    } finally {
      if (!shouldShowControls) {
        setIsCombiningAudio(false);
      }
    }
  };

  // Function to finalize the audio combination after user adjusts volumes
  const finalizeAudioCombination = () => {
    if (audioBlob && selectedSpotifyTrack?.preview_url) {
      // In a real implementation, this would create a final mix with the set volume levels
      // For now, we'll just update the combined audio with the current volume settings
      combineAudioWithSpotify(
        audioBlob,
        selectedSpotifyTrack.preview_url,
        userAudioVolume,
        spotifyAudioVolume,
        false,
      );
      setShowVolumeControls(false);
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);

      // Convert File to Blob
      const blob = new Blob([file], { type: file.type });
      setAudioBlob(blob);
      setAudioURL(URL.createObjectURL(blob));

      // If we already have a Spotify track selected, combine the audio
      if (selectedSpotifyTrack?.preview_url) {
        combineAudioWithSpotify(blob, selectedSpotifyTrack.preview_url);
      }
    }
  };

  const handleVisualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVisualFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setVisualPreview(previewUrl);
    }
  };

  const togglePlayback = () => {
    // Use combined audio if available, otherwise use the original audio
    if ((combinedAudioURL || audioURL) && audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const captureWebcamImage = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setVisualPreview(imageSrc);

        // Convert base64 to blob
        fetch(imageSrc)
          .then((res) => res.blob())
          .then((blob) => {
            const file = new File([blob], `webcam-${Date.now()}.jpg`, {
              type: "image/jpeg",
            });
            setVisualFile(file);
          });
      }
    }
  };

  const toggleWebcam = () => {
    setShowWebcam(!showWebcam);
  };

  const handleSoundLayerToggle = (layer: string) => {
    setSelectedSoundLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer],
    );
  };

  const handleVisualFilterToggle = (filter: string) => {
    setSelectedVisualFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter],
    );
  };

  const handleSubmit = () => {
    // If we have volume controls showing, finalize the audio first
    if (showVolumeControls) {
      finalizeAudioCombination();
    }

    if (selectedMood) {
      const vibeData: VibeData = {
        mood: selectedMood,
        audio: audioFile,
        audioBlob: audioBlob,
        audioEffects: [], // To be implemented
        soundLayers: selectedSoundLayers,
        backgroundMusic: selectedBackgroundMusic,
        spotifyTrack: selectedSpotifyTrack
          ? {
              id: selectedSpotifyTrack.id,
              name: selectedSpotifyTrack.name,
              artist: selectedSpotifyTrack.artists
                .map((a) => a.name)
                .join(", "),
              imageUrl: selectedSpotifyTrack.album.images[0]?.url || "",
              previewUrl: selectedSpotifyTrack.preview_url,
              externalUrl: selectedSpotifyTrack.external_urls.spotify,
              volume: spotifyAudioVolume,
            }
          : undefined,
        visual: visualFile,
        visualFilters: selectedVisualFilters,
        tags,
        caption,
        combinedAudio: combinedAudioBlob,
        userAudioVolume: userAudioVolume,
      };
      onSubmit(vibeData);
      onOpenChange(false);
    }
  };

  const selectedMoodColor =
    moodCategories.find((m) => m.id === selectedMood)?.color ||
    "from-gray-400 to-gray-600";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Create Your Vibe
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mood">Select Mood</TabsTrigger>
            <TabsTrigger value="create" disabled={!selectedMood}>
              Create Vibe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="space-y-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {moodCategories.map((mood) => (
                <motion.div
                  key={mood.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMoodSelect(mood.id)}
                  className={`
                    relative rounded-xl p-6 cursor-pointer transition-all duration-300
                    bg-gradient-to-br ${mood.color}
                    ${selectedMood === mood.id ? "ring-4 ring-white ring-opacity-50 shadow-lg" : "opacity-80"}
                  `}
                >
                  <h3 className="text-white font-medium text-lg">
                    {mood.name}
                  </h3>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <Button
                onClick={handleNextStep}
                disabled={!selectedMood}
                className="px-8"
              >
                Next
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6 py-4">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Left side - Audio recording */}
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-medium">Audio (15-30 seconds)</h3>

                <div
                  className={`
                  p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center
                  ${isRecording ? "bg-red-100 border-red-400" : "border-gray-300"}
                  min-h-[200px]
                `}
                >
                  {audioFile ? (
                    <div className="w-full space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm truncate max-w-[200px]">
                          {audioFile.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={togglePlayback}
                        >
                          {isPlaying ? (
                            <Pause className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </Button>
                      </div>

                      {/* Audio waveform visualization */}
                      <div className="w-full h-16 bg-gray-100 rounded-md overflow-hidden">
                        <div className="flex items-end justify-around h-full p-1">
                          {Array.from({ length: 40 }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 bg-gradient-to-t ${selectedMoodColor} rounded-full`}
                              style={{ height: `${Math.random() * 100}%` }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAudioFile(null);
                            setAudioBlob(null);
                            setAudioURL(null);
                            setCombinedAudioBlob(null);
                            setCombinedAudioURL(null);
                            setShowVolumeControls(false);
                            if (audioPlayerRef.current) {
                              audioPlayerRef.current.pause();
                              audioPlayerRef.current = null;
                            }
                          }}
                        >
                          <X className="h-4 w-4 mr-1" /> Remove
                        </Button>
                        <span className="text-xs text-gray-500">
                          {recordingTime > 0
                            ? `00:${recordingTime.toString().padStart(2, "0")}`
                            : "00:00"}
                        </span>
                      </div>

                      {/* Sound layers based on mood */}
                      {selectedMood && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">
                            Add Sound Layers
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {getMoodSoundLayers(selectedMood).map((layer) => (
                              <Badge
                                key={layer}
                                variant={
                                  selectedSoundLayers.includes(layer)
                                    ? "default"
                                    : "outline"
                                }
                                className="cursor-pointer"
                                onClick={() => handleSoundLayerToggle(layer)}
                              >
                                <Music className="h-3 w-3 mr-1" />
                                {layer
                                  .split("-")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1),
                                  )
                                  .join(" ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Spotify Background Music Selection */}
                      {selectedMood && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">
                            Spotify Background Music
                          </h4>

                          {/* Spotify Search */}
                          <div className="flex gap-2 mb-3">
                            <Input
                              placeholder="Search for tracks..."
                              value={spotifySearchQuery}
                              onChange={(e) =>
                                setSpotifySearchQuery(e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && handleSpotifySearch()
                              }
                              className="flex-1"
                            />
                            <Button onClick={handleSpotifySearch} size="sm">
                              <Search className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Spotify Tracks List */}
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {isLoadingSpotifyTracks ? (
                              <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                              </div>
                            ) : spotifyTracks.length === 0 ? (
                              <p className="text-xs text-gray-500 text-center py-2">
                                {spotifySearchQuery
                                  ? "No tracks found. Try a different search."
                                  : "Loading tracks based on your mood..."}
                              </p>
                            ) : (
                              spotifyTracks.map((track) => (
                                <div
                                  key={track.id}
                                  className={`p-2 rounded-md cursor-pointer transition-all ${selectedSpotifyTrack?.id === track.id ? "bg-primary/20 border border-primary/50" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"}`}
                                  onClick={() =>
                                    handleSelectSpotifyTrack(track)
                                  }
                                >
                                  <div className="flex items-center gap-3">
                                    {track.album.images[0] && (
                                      <img
                                        src={track.album.images[0].url}
                                        alt={track.album.name}
                                        className="h-10 w-10 rounded object-cover"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">
                                        {track.name}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {track.artists
                                          .map((a) => a.name)
                                          .join(", ")}
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      {track.preview_url && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 rounded-full"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleSpotifyPreview(
                                              track.id,
                                              track.preview_url,
                                            );
                                          }}
                                        >
                                          {spotifyPreviewPlaying ===
                                          track.id ? (
                                            <Pause className="h-4 w-4" />
                                          ) : (
                                            <Play className="h-4 w-4" />
                                          )}
                                        </Button>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 rounded-full"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(
                                            track.external_urls.spotify,
                                            "_blank",
                                          );
                                        }}
                                      >
                                        <ExternalLink className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          {/* Selected Spotify Track */}
                          {selectedSpotifyTrack && (
                            <div className="mt-3 p-2 bg-primary/10 rounded-md">
                              <p className="text-xs font-medium">
                                Selected Track:
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {selectedSpotifyTrack.album.images[0] && (
                                  <img
                                    src={
                                      selectedSpotifyTrack.album.images[0].url
                                    }
                                    alt={selectedSpotifyTrack.album.name}
                                    className="h-8 w-8 rounded object-cover"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {selectedSpotifyTrack.name}
                                  </p>
                                  <p className="text-xs text-gray-500 truncate">
                                    {selectedSpotifyTrack.artists
                                      .map((a) => a.name)
                                      .join(", ")}
                                  </p>
                                </div>
                              </div>
                              {isCombiningAudio && !showVolumeControls && (
                                <div className="mt-2 flex items-center gap-2">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  <p className="text-xs">
                                    Combining with your audio...
                                  </p>
                                </div>
                              )}
                              {showVolumeControls && (
                                <div className="mt-2 space-y-3">
                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <p className="text-xs font-medium flex items-center">
                                        <Volume2 className="h-3 w-3 mr-1" />{" "}
                                        Your Voice Volume
                                      </p>
                                      <span className="text-xs">
                                        {userAudioVolume}%
                                      </span>
                                    </div>
                                    <Slider
                                      value={[userAudioVolume]}
                                      onValueChange={(value) =>
                                        setUserAudioVolume(value[0])
                                      }
                                      max={100}
                                      step={5}
                                    />
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                      <p className="text-xs font-medium flex items-center">
                                        <Music className="h-3 w-3 mr-1" />{" "}
                                        Spotify Track Volume
                                      </p>
                                      <span className="text-xs">
                                        {spotifyAudioVolume}%
                                      </span>
                                    </div>
                                    <Slider
                                      value={[spotifyAudioVolume]}
                                      onValueChange={(value) =>
                                        setSpotifyAudioVolume(value[0])
                                      }
                                      max={100}
                                      step={5}
                                    />
                                  </div>

                                  <Button
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={finalizeAudioCombination}
                                  >
                                    Confirm Mix
                                  </Button>
                                </div>
                              )}
                              {combinedAudioURL &&
                                !isCombiningAudio &&
                                !showVolumeControls && (
                                  <div className="mt-2">
                                    <p className="text-xs text-green-600">
                                      ✓ Combined with your audio
                                    </p>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-64 h-16 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                          {/* Audio visualization placeholder */}
                          <div className="flex items-end justify-around w-full h-full p-1">
                            {Array.from({ length: 40 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-1 bg-gradient-to-t ${selectedMoodColor} rounded-full transition-all duration-75`}
                                style={{
                                  height: `${isRecording ? Math.random() * 100 : Math.random() * 30}%`,
                                  animationDelay: `${i * 0.05}s`,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        {isRecording && (
                          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {recordingTime}s
                          </div>
                        )}
                      </div>

                      <Button
                        variant={isRecording ? "destructive" : "outline"}
                        size="lg"
                        className="rounded-full h-16 w-16 flex items-center justify-center"
                        onClick={toggleRecording}
                      >
                        <Mic className="h-6 w-6" />
                      </Button>
                      <p className="text-sm text-gray-500">
                        {isRecording ? "Recording..." : "Tap to record"}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">or</span>
                        <label className="cursor-pointer">
                          <Input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={handleAudioUpload}
                          />
                          <span className="text-xs text-primary underline">
                            upload audio file
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Audio Length</h4>
                  <Slider defaultValue={[23]} max={30} min={15} step={1} />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>15s</span>
                    <span>30s</span>
                  </div>
                </div>
              </div>

              {/* Right side - Visual upload */}
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-medium">Visual</h3>

                <div
                  className={`
                  p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center
                  border-gray-300 min-h-[200px] relative
                `}
                >
                  {showWebcam ? (
                    <div className="w-full h-full relative">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="w-full h-[200px] object-cover rounded-md"
                      />
                      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-black/50 text-white border-none hover:bg-black/70"
                          onClick={captureWebcamImage}
                        >
                          Capture
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-black/50 text-white border-none hover:bg-black/70"
                          onClick={() => setShowWebcam(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : visualPreview ? (
                    <div className="w-full h-full relative">
                      <img
                        src={visualPreview}
                        alt="Visual preview"
                        className="w-full h-[200px] object-cover rounded-md"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2 bg-black/50 text-white border-none hover:bg-black/70"
                        onClick={() => {
                          setVisualFile(null);
                          setVisualPreview(null);
                          setSelectedVisualFilters([]);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>

                      {/* Visual filters based on mood */}
                      {selectedMood && visualPreview && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="bg-black/50 p-2 rounded-md">
                            <h4 className="text-xs font-medium text-white mb-1">
                              Visual Filters
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {getMoodVisualFilters(selectedMood).map(
                                (filter) => (
                                  <Badge
                                    key={filter}
                                    variant={
                                      selectedVisualFilters.includes(filter)
                                        ? "default"
                                        : "outline"
                                    }
                                    className="cursor-pointer text-xs"
                                    onClick={() =>
                                      handleVisualFilterToggle(filter)
                                    }
                                  >
                                    <Wand2 className="h-2 w-2 mr-1" />
                                    {filter
                                      .split("-")
                                      .map(
                                        (word) =>
                                          word.charAt(0).toUpperCase() +
                                          word.slice(1),
                                      )
                                      .join(" ")}
                                  </Badge>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="flex gap-4">
                        <label className="cursor-pointer">
                          <Input
                            type="file"
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={handleVisualUpload}
                          />
                          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Image className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-xs text-center mt-1">Upload</p>
                        </label>

                        <button
                          className="cursor-pointer"
                          onClick={toggleWebcam}
                        >
                          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                            <Webcam className="h-8 w-8 text-gray-400" />
                          </div>
                          <p className="text-xs text-center mt-1">Camera</p>
                        </button>
                      </div>

                      <p className="text-sm text-gray-500">
                        Upload image or video
                      </p>
                      <p className="text-xs text-gray-400">
                        JPG, PNG, GIF or MP4
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Caption (optional)</h4>
                  <Textarea
                    placeholder="Add a caption to your vibe..."
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="resize-none"
                    maxLength={100}
                  />
                  <p className="text-xs text-right text-gray-500">
                    {caption.length}/100
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleAddTag}
                      disabled={!currentTag.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview section */}
            <div className="mt-6 p-4 rounded-xl bg-gray-50 border">
              <h3 className="text-lg font-medium mb-3">Preview Your Vibe</h3>
              <div className="flex items-center gap-4">
                {visualPreview && (
                  <img
                    src={visualPreview}
                    alt="Visual preview"
                    className="w-20 h-20 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`bg-gradient-to-r ${selectedMoodColor} text-white`}
                    >
                      {moodCategories.find((m) => m.id === selectedMood)?.name}
                    </Badge>
                    {tags.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {tags.length} tags
                      </span>
                    )}
                  </div>
                  {caption && (
                    <p className="text-sm mt-1 text-gray-700">{caption}</p>
                  )}
                  {(audioFile || selectedSpotifyTrack) && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={togglePlayback}
                        disabled={isCombiningAudio && !showVolumeControls}
                      >
                        {isPlaying ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full w-1/3 bg-gradient-to-r ${selectedMoodColor}`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {combinedAudioURL
                          ? "Combined Audio"
                          : audioFile
                            ? "Your Audio"
                            : "Spotify Track"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handlePreviousStep}>
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!audioFile || !visualFile}
                className="px-8"
              >
                <Send className="h-4 w-4 mr-2" /> Post Vibe
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default VibeCreator;
