import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { vibeService } from "../services/vibeService";
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
  Image as ImageIcon,
  Play,
  Pause,
  X,
  Send,
  Music,
  Wand2,
  Search,
  Loader2,
  ExternalLink,
  Volume2,
} from "lucide-react";
import jamendoService, { JamendoTrack } from "../services/jamendoService";
import { useReactMediaRecorder } from "react-media-recorder";
import Webcam from "react-webcam";

interface JamendoVibeCreatorProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit?: (vibeData: VibeData) => void;
}

interface VibeData {
  mood: string;
  soundLayers?: string[];
  backgroundMusic?: string;
  jamendoTrack?: {
    id: string;
    name: string;
    artist: string;
    imageUrl: string;
    audioUrl: string;
    externalUrl: string;
    volume?: number;
  };
  visual: File | null;
  visualFilters?: string[];
  tags: string[];
  caption: string;
  text: string;
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

const JamendoVibeCreator: React.FC<JamendoVibeCreatorProps> = ({
  open = true,
  onOpenChange = () => {},
  onSubmit = () => {},
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mood");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedBackgroundMusic, setSelectedBackgroundMusic] = useState<
    string | null
  >(null);
  const [jamendoTracks, setJamendoTracks] = useState<JamendoTrack[]>([]);
  const [selectedJamendoTrack, setSelectedJamendoTrack] =
    useState<JamendoTrack | null>(null);
  const [isLoadingJamendoTracks, setIsLoadingJamendoTracks] = useState(false);
  const [jamendoSearchQuery, setJamendoSearchQuery] = useState("");
  const [jamendoPreviewPlaying, setJamendoPreviewPlaying] = useState<
    string | null
  >(null);
  const jamendoPreviewRef = useRef<HTMLAudioElement | null>(null);
  const [vibeText, setVibeText] = useState("");

  // Removed audio recording functionality
  const [visualFile, setVisualFile] = useState<File | null>(null);
  const [visualPreview, setVisualPreview] = useState<string | null>(null);
  const [jamendoAudioVolume, setJamendoAudioVolume] = useState(50);
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

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    // Load Jamendo tracks based on the selected mood
    loadJamendoTracksByMood(moodId);
  };

  const loadJamendoTracksByMood = async (moodId: string) => {
    try {
      setIsLoadingJamendoTracks(true);
      const tracks = await jamendoService.searchTracksByMood(moodId);
      setJamendoTracks(tracks);
    } catch (error) {
      console.error("Error loading Jamendo tracks:", error);
    } finally {
      setIsLoadingJamendoTracks(false);
    }
  };

  const handleJamendoSearch = async () => {
    if (!jamendoSearchQuery.trim()) return;

    try {
      setIsLoadingJamendoTracks(true);
      const tracks =
        await jamendoService.searchTracksByMood(jamendoSearchQuery);
      setJamendoTracks(tracks);
    } catch (error) {
      console.error("Error searching Jamendo tracks:", error);
    } finally {
      setIsLoadingJamendoTracks(false);
    }
  };

  const handleSelectJamendoTrack = (track: JamendoTrack) => {
    setSelectedJamendoTrack(track);
  };

  const toggleJamendoPreview = (trackId: string, audioUrl: string) => {
    if (!audioUrl) return;

    if (jamendoPreviewPlaying === trackId) {
      // Stop playing
      if (jamendoPreviewRef.current) {
        jamendoPreviewRef.current.pause();
        jamendoPreviewRef.current = null;
      }
      setJamendoPreviewPlaying(null);
    } else {
      // Pause other audio if playing
      if (jamendoPreviewRef.current) {
        jamendoPreviewRef.current.pause();
      }

      // Create new audio player
      jamendoPreviewRef.current = new Audio(audioUrl);
      jamendoPreviewRef.current.volume = jamendoAudioVolume / 100;
      jamendoPreviewRef.current.play();
      jamendoPreviewRef.current.onended = () => {
        setJamendoPreviewPlaying(null);
      };
      setJamendoPreviewPlaying(trackId);
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

  // Removed audio recording and processing functionality

  const handleVisualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVisualFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setVisualPreview(previewUrl);
    }
  };

  // Removed audio playback functionality

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

  const handleSubmit = async () => {
    if (selectedMood) {
      try {
        // Validate required fields
        if (!visualFile) {
          throw new Error("Visual is required");
        }

        // Upload visual file to Supabase storage
        let visualUrl = "";
        if (visualFile) {
          const visualFileName = `vibes/jamendo/${Date.now()}-visual.${visualFile.name.split(".").pop()}`;
          const { data: visualData, error: visualError } =
            await supabase.storage
              .from("vibe-media")
              .upload(visualFileName, visualFile, {
                contentType: visualFile.type,
                upsert: true,
              });

          if (visualError) {
            throw new Error(`Error uploading visual: ${visualError.message}`);
          }

          // Get public URL for the visual file
          const { data: visualUrlData } = supabase.storage
            .from("vibe-media")
            .getPublicUrl(visualFileName);

          visualUrl = visualUrlData.publicUrl;
        }

        // Prepare vibe data for database
        const vibeDataForDB = {
          mood: selectedMood,
          visual_url: visualUrl,
          caption: caption,
          tags: tags,
          sound_layers: selectedSoundLayers,
          visual_filters: selectedVisualFilters,
          jamendo_track_id: selectedJamendoTrack?.id,
          jamendo_track_name: selectedJamendoTrack?.name,
          jamendo_track_artist: selectedJamendoTrack?.artist_name,
          jamendo_track_image_url: selectedJamendoTrack?.image,
          jamendo_track_audio_url: selectedJamendoTrack?.audio,
          jamendo_track_external_url: selectedJamendoTrack?.shareurl,
          text: vibeText,
        };

        // Save vibe data to database
        const savedVibe = await vibeService.saveVibe(vibeDataForDB);
        console.log("Jamendo vibe saved successfully:", savedVibe);

        // Call the original onSubmit with the local vibe data
        const vibeData: VibeData = {
          mood: selectedMood,
          soundLayers: selectedSoundLayers,
          backgroundMusic: selectedBackgroundMusic,
          jamendoTrack: selectedJamendoTrack
            ? {
                id: selectedJamendoTrack.id,
                name: selectedJamendoTrack.name,
                artist: selectedJamendoTrack.artist_name,
                imageUrl: selectedJamendoTrack.image,
                audioUrl: selectedJamendoTrack.audio,
                externalUrl: selectedJamendoTrack.shareurl,
                volume: jamendoAudioVolume,
              }
            : undefined,
          visual: visualFile,
          visualFilters: selectedVisualFilters,
          tags,
          caption,
          text: vibeText,
        };

        onSubmit(vibeData);
        onOpenChange(false);

        // Navigate to home page after successful submission
        navigate("/");
      } catch (error) {
        console.error("Error saving vibe:", error);
        alert(error instanceof Error ? error.message : "Failed to save vibe");
      }
    } else {
      alert("Please select a mood");
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
            Create Your Vibe with Jamendo
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
              {/* Left side - Text input and music selection */}
              <div className="flex-1 space-y-4">
                <h3 className="text-lg font-medium">Your Vibe Text</h3>

                <div className="p-6 rounded-xl border-2 border-dashed border-gray-300 min-h-[200px]">
                  <div className="w-full space-y-4">
                    <Textarea
                      placeholder="Share your thoughts, feelings, or whatever's on your mind..."
                      value={vibeText}
                      onChange={(e) => setVibeText(e.target.value)}
                      className="min-h-[150px] resize-none"
                    />
                    <p className="text-xs text-right text-gray-500">
                      {vibeText.length}/500 characters
                    </p>

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

                    {/* Jamendo Background Music Selection */}
                    {selectedMood && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">
                          Jamendo Background Music
                        </h4>

                        {/* Jamendo Search */}
                        <div className="flex gap-2 mb-3">
                          <Input
                            placeholder="Search for tracks..."
                            value={jamendoSearchQuery}
                            onChange={(e) =>
                              setJamendoSearchQuery(e.target.value)
                            }
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleJamendoSearch()
                            }
                            className="flex-1"
                          />
                          <Button onClick={handleJamendoSearch} size="sm">
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Jamendo Tracks List */}
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                          {isLoadingJamendoTracks ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                          ) : jamendoTracks.length === 0 ? (
                            <p className="text-xs text-gray-500 text-center py-2">
                              {jamendoSearchQuery
                                ? "No tracks found. Try a different search."
                                : "Loading tracks based on your mood..."}
                            </p>
                          ) : (
                            jamendoTracks.map((track) => (
                              <div
                                key={track.id}
                                className={`p-2 rounded-md cursor-pointer transition-all ${selectedJamendoTrack?.id === track.id ? "bg-primary/20 border border-primary/50" : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"}`}
                                onClick={() => handleSelectJamendoTrack(track)}
                              >
                                <div className="flex items-center gap-3">
                                  <img
                                    src={track.image}
                                    alt={track.name}
                                    className="h-10 w-10 rounded object-cover"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm truncate">
                                      {track.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                      {track.artist_name}
                                    </p>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 rounded-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleJamendoPreview(
                                          track.id,
                                          track.audio,
                                        );
                                      }}
                                    >
                                      {jamendoPreviewPlaying === track.id ? (
                                        <Pause className="h-4 w-4" />
                                      ) : (
                                        <Play className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 rounded-full"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(track.shareurl, "_blank");
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

                        {/* Selected Jamendo Track */}
                        {selectedJamendoTrack && (
                          <div className="mt-3 p-2 bg-primary/10 rounded-md">
                            <p className="text-xs font-medium">
                              Selected Track:
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <img
                                src={selectedJamendoTrack.image}
                                alt={selectedJamendoTrack.name}
                                className="h-8 w-8 rounded object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {selectedJamendoTrack.name}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {selectedJamendoTrack.artist_name}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between items-center">
                                <p className="text-xs font-medium flex items-center">
                                  <Music className="h-3 w-3 mr-1" /> Track
                                  Volume
                                </p>
                                <span className="text-xs">
                                  {jamendoAudioVolume}%
                                </span>
                              </div>
                              <Slider
                                value={[jamendoAudioVolume]}
                                onValueChange={(value) =>
                                  setJamendoAudioVolume(value[0])
                                }
                                max={100}
                                step={5}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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
                            <ImageIcon className="h-8 w-8 text-gray-400" />
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
                  {vibeText && (
                    <p className="text-sm mt-1 text-gray-700 line-clamp-2">
                      {vibeText}
                    </p>
                  )}
                  {selectedJamendoTrack && (
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-full"
                        onClick={() =>
                          toggleJamendoPreview(
                            selectedJamendoTrack.id,
                            selectedJamendoTrack.audio,
                          )
                        }
                      >
                        {jamendoPreviewPlaying === selectedJamendoTrack.id ? (
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
                        Jamendo Track
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
                disabled={!vibeText || !visualFile}
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

export default JamendoVibeCreator;
