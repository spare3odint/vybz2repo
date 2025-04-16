import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import VibeCard from "./VibeCard";
import { Button } from "./ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { Slider } from "./ui/slider";
import { RefreshCcw, Filter, Volume2 } from "lucide-react";

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
  const [vibes, setVibes] = useState<Vibe[]>([
    {
      id: "1",
      visual:
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
      audio: "/path/to/audio1.mp3",
      mood: "lonely but hopeful",
      tags: ["nostalgia", "rainy day"],
      duration: 22,
      createdAt: "2023-09-15T12:00:00Z",
    },
    {
      id: "2",
      visual:
        "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80",
      audio: "/path/to/audio2.mp3",
      mood: "chaotic energy",
      tags: ["villain era", "midnight thoughts"],
      duration: 18,
      createdAt: "2023-09-16T14:30:00Z",
    },
    {
      id: "3",
      visual:
        "https://images.unsplash.com/photo-1494548162494-384bba4ab999?w=800&q=80",
      audio: "/path/to/audio3.mp3",
      mood: "zen mode",
      tags: ["chill", "sunset vibes"],
      duration: 25,
      createdAt: "2023-09-17T09:15:00Z",
    },
  ]);

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
          {filteredVibes.length > 0 ? (
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
              <VibeCard vibe={filteredVibes[currentIndex]} volume={volume} />
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
        {filteredVibes.map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-white w-4" : "bg-white/50"}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default VibeFeed;
