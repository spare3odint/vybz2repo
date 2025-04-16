import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Heart, MessageCircle, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface VibeCardProps {
  id?: string;
  visualSrc?: string;
  audioSrc?: string;
  moodTags?: string[];
  glowColor?: string;
  likes?: number;
  replies?: number;
  createdAt?: string;
}

const VibeCard = ({
  id = "vibe-1",
  visualSrc = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80",
  audioSrc = "",
  moodTags = ["nostalgic", "dreamy", "hopeful"],
  glowColor = "rgba(138, 43, 226, 0.6)",
  likes = 42,
  replies = 7,
  createdAt = "2 hours ago",
}: VibeCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [pulseIntensity, setPulseIntensity] = useState(1);

  // Simulate audio playback and waveform animation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });

        // Simulate audio intensity for background pulse effect
        setPulseIntensity(0.8 + Math.random() * 0.4);
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && audioProgress >= 100) {
      setAudioProgress(0);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  // Generate random waveform bars for visualization
  const generateWaveform = () => {
    return Array.from({ length: 40 }, (_, i) => {
      const height = 10 + Math.random() * 30;
      const isActive = (i / 40) * 100 <= audioProgress;
      return (
        <motion.div
          key={i}
          className={`w-1 mx-[1px] rounded-full ${isActive ? "bg-primary" : "bg-primary/30"}`}
          style={{ height: `${height}px` }}
          animate={{
            height:
              isPlaying && isActive
                ? [height, height * pulseIntensity, height]
                : height,
            opacity: isActive ? 1 : 0.5,
          }}
          transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
        />
      );
    });
  };

  return (
    <motion.div
      className="relative w-full max-w-[400px] h-[600px] mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full h-full overflow-hidden rounded-3xl bg-background relative">
        {/* Glow effect border */}
        <motion.div
          className="absolute inset-0 rounded-3xl z-0"
          style={{
            boxShadow: `0 0 20px ${glowColor}`,
            opacity: 0.7,
          }}
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.01, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Visual element (image/video) */}
        <div className="relative w-full h-[70%] overflow-hidden">
          <img
            src={visualSrc}
            alt="Vibe visual"
            className="w-full h-full object-cover"
          />

          {/* Play/Pause button overlay */}
          <motion.button
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      w-16 h-16 rounded-full bg-black/50 flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </motion.button>

          {/* Mood tags */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {moodTags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-black/50 text-white backdrop-blur-sm"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Time indicator */}
          <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
            {createdAt}
          </div>
        </div>

        {/* Audio waveform visualization */}
        <div className="w-full h-[15%] px-6 flex items-center justify-center">
          <div className="w-full h-full flex items-center">
            {generateWaveform()}
          </div>
        </div>

        {/* Interaction buttons */}
        <div className="w-full h-[15%] px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <motion.button
              className="flex items-center gap-2"
              whileTap={{ scale: 0.9 }}
              onClick={toggleLike}
            >
              <Heart
                className={`w-6 h-6 ${isLiked ? "fill-red-500 text-red-500" : "text-foreground"}`}
              />
              <span className="text-sm">{isLiked ? likes + 1 : likes}</span>
            </motion.button>

            <motion.button
              className="flex items-center gap-2"
              whileTap={{ scale: 0.9 }}
            >
              <MessageCircle className="w-6 h-6 text-foreground" />
              <span className="text-sm">{replies}</span>
            </motion.button>
          </div>

          <motion.button whileTap={{ scale: 0.9 }}>
            <Share2 className="w-6 h-6 text-foreground" />
          </motion.button>
        </div>

        {/* Creator info */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <Avatar className="w-8 h-8 border-2 border-primary">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=vibe" />
            <AvatarFallback>V</AvatarFallback>
          </Avatar>
          <div className="text-xs opacity-70">Anonymous Viber</div>
        </div>
      </Card>
    </motion.div>
  );
};

export default VibeCard;
