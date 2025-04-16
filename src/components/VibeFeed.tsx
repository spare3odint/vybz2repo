import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VibeCard from "./VibeCard";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Slider } from "./ui/slider";
import { RefreshCcw, Filter, Volume2 } from "lucide-react";
import { vibeService, VibeData } from "../services/vibeService";

interface Vibe {
  id: string;
  visual: string;
  audio: string;
  mood: string;
  tags: string[];
  duration: number;
  createdAt: string;
}

const VibeFeed = () => {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [currentMood, setCurrentMood] = useState<string>("all");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFiltering, setIsFiltering] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);

  // Background gradient based on current mood
  const getMoodGradient = (mood: string) => {
    switch (mood) {
      case "lonely but hopeful":
        return "bg-gradient-to-br from-blue-900 via-purple-800 to-indigo-900";
      case "chaotic energy":
        return "bg-gradient-to-br from-red-600 via-orange-500 to-yellow-500";
      case "zen mode":
        return "bg-gradient-to-br from-teal-500 via-blue-400 to-cyan-300";
      default:
        return "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900";
    }
  };

  // Get glow color based on mood
  const getMoodColor = (mood: string) => {
    switch (mood) {
      case "lonely but hopeful":
        return "rgba(79, 70, 229, 0.6)";
      case "chaotic energy":
        return "rgba(239, 68, 68, 0.6)";
      case "zen mode":
        return "rgba(20, 184, 166, 0.6)";
      default:
        return "rgba(138, 43, 226, 0.6)";
    }
  };

  // Handle swipe to next vibe
  const handleSwipeNext = () => {
    if (currentIndex < vibes.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Loop back to the beginning
      setCurrentIndex(0);
    }
  };

  // Handle swipe to previous vibe
  const handleSwipePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      // Loop to the end
      setCurrentIndex(vibes.length - 1);
    }
  };

  // Filter vibes by mood
  const handleMoodChange = (mood: string) => {
    setCurrentMood(mood);
    setCurrentIndex(0); // Reset to first vibe when changing mood
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  // Fetch vibes from the database
  useEffect(() => {
    const fetchVibes = async () => {
      try {
        setLoading(true);
        const dbVibes = await vibeService.getAllVibes();

        // Transform the database vibes to match the Vibe interface
        const transformedVibes: Vibe[] = dbVibes.map((dbVibe) => ({
          id: dbVibe.id || String(Math.random()),
          visual:
            dbVibe.visual_url ||
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
          audio: dbVibe.audio_url || "",
          mood: dbVibe.mood,
          tags: dbVibe.tags || [],
          duration: 20, // Default duration
          createdAt: dbVibe.created_at || new Date().toISOString(),
        }));

        setVibes(transformedVibes);
      } catch (err) {
        console.error("Error fetching vibes:", err);
        setError("Failed to load vibes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchVibes();
  }, []);

  // Get filtered vibes based on current mood
  const filteredVibes =
    currentMood === "all"
      ? vibes
      : vibes.filter((vibe) => vibe.mood === currentMood);

  return (
    <div
      className={`relative w-full h-full min-h-[750px] overflow-hidden transition-colors duration-1000 ${getMoodGradient(filteredVibes[currentIndex]?.mood || "all")}`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute top-0 left-0 w-64 h-64 rounded-full bg-white/10 blur-3xl"
          animate={{
            x: [0, 100, 50, 0],
            y: [0, 50, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-white/10 blur-3xl"
          animate={{
            x: [0, -100, -50, 0],
            y: [0, -50, -100, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />
      </div>

      {/* Top controls */}
      <div className="relative z-10 w-full p-4 flex justify-between items-center">
        <Tabs defaultValue="all" className="w-auto">
          <TabsList className="bg-black/20 backdrop-blur-md">
            <TabsTrigger
              value="all"
              onClick={() => handleMoodChange("all")}
              className="data-[state=active]:bg-white/20"
            >
              All Vibes
            </TabsTrigger>
            <TabsTrigger
              value="lonely but hopeful"
              onClick={() => handleMoodChange("lonely but hopeful")}
              className="data-[state=active]:bg-blue-500/30"
            >
              Lonely but Hopeful
            </TabsTrigger>
            <TabsTrigger
              value="chaotic energy"
              onClick={() => handleMoodChange("chaotic energy")}
              className="data-[state=active]:bg-red-500/30"
            >
              Chaotic Energy
            </TabsTrigger>
            <TabsTrigger
              value="zen mode"
              onClick={() => handleMoodChange("zen mode")}
              className="data-[state=active]:bg-teal-500/30"
            >
              Zen Mode
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="bg-black/20 backdrop-blur-md border-none hover:bg-white/20"
            onClick={() => setIsFiltering(!isFiltering)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="bg-black/20 backdrop-blur-md border-none hover:bg-white/20"
            onClick={() => setCurrentIndex(0)}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {isFiltering && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 mx-auto w-full max-w-md p-4 bg-black/30 backdrop-blur-md rounded-lg mb-4"
          >
            <div className="flex items-center gap-4">
              <Volume2 className="h-5 w-5 text-white/70" />
              <Slider
                defaultValue={[volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-full"
              />
              <span className="text-white/70 text-sm">{volume}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main vibe card container */}
      <div className="relative z-10 w-full h-full flex items-center justify-center px-4 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white text-center p-8 bg-black/20 backdrop-blur-md rounded-xl"
            >
              <p className="text-xl">Loading vibes...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white text-center p-8 bg-black/20 backdrop-blur-md rounded-xl"
            >
              <p className="text-xl text-red-400">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="mt-4 bg-white/20 hover:bg-white/30"
              >
                Try Again
              </Button>
            </motion.div>
          ) : filteredVibes.length > 0 ? (
            <motion.div
              key={filteredVibes[currentIndex].id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md mx-auto"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.7}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe < -70) {
                  handleSwipeNext();
                } else if (swipe > 70) {
                  handleSwipePrev();
                }
              }}
            >
              <VibeCard
                id={filteredVibes[currentIndex].id}
                visualSrc={filteredVibes[currentIndex].visual}
                audioSrc={filteredVibes[currentIndex].audio}
                moodTags={filteredVibes[currentIndex].tags}
                glowColor={getMoodColor(filteredVibes[currentIndex].mood)}
                createdAt={new Date(
                  filteredVibes[currentIndex].createdAt,
                ).toLocaleString()}
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-white text-center p-8 bg-black/20 backdrop-blur-md rounded-xl"
            >
              <p className="text-xl">No vibes found for this mood</p>
              <p className="mt-2 text-white/70">
                Try a different mood or create your own vibe
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation dots */}
      <div className="relative z-10 w-full flex justify-center gap-2 pb-6">
        {!loading &&
          !error &&
          filteredVibes.map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-white w-4" : "bg-white/50"}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
      </div>

      {/* Refresh button */}
      <div className="absolute bottom-4 right-4 z-20">
        <Button
          variant="outline"
          size="icon"
          className="bg-black/20 backdrop-blur-md border-none hover:bg-white/20"
          onClick={async () => {
            setLoading(true);
            try {
              const dbVibes = await vibeService.getAllVibes();
              const transformedVibes: Vibe[] = dbVibes.map((dbVibe) => ({
                id: dbVibe.id || String(Math.random()),
                visual:
                  dbVibe.visual_url ||
                  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
                audio: dbVibe.audio_url || "",
                mood: dbVibe.mood,
                tags: dbVibe.tags || [],
                duration: 20,
                createdAt: dbVibe.created_at || new Date().toISOString(),
              }));
              setVibes(transformedVibes);
              setCurrentIndex(0);
              setError(null);
            } catch (err) {
              console.error("Error refreshing vibes:", err);
              setError("Failed to refresh vibes. Please try again.");
            } finally {
              setLoading(false);
            }
          }}
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default VibeFeed;
