import React from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface TrendingVibe {
  id: string;
  name: string;
  color: string;
  secondaryColor: string;
  count: number;
}

interface TrendingVibesProps {
  vibes?: TrendingVibe[];
  onSelectVibe?: (vibe: TrendingVibe) => void;
}

const defaultVibes: TrendingVibe[] = [
  {
    id: "1",
    name: "villain era",
    color: "#8A2BE2",
    secondaryColor: "#4B0082",
    count: 1243,
  },
  {
    id: "2",
    name: "nostalgia core",
    color: "#FF69B4",
    secondaryColor: "#C71585",
    count: 987,
  },
  {
    id: "3",
    name: "lonely but hopeful",
    color: "#1E90FF",
    secondaryColor: "#4169E1",
    count: 756,
  },
  {
    id: "4",
    name: "chaotic energy",
    color: "#FF4500",
    secondaryColor: "#FF8C00",
    count: 632,
  },
  {
    id: "5",
    name: "zen mode",
    color: "#20B2AA",
    secondaryColor: "#5F9EA0",
    count: 521,
  },
];

const TrendingVibes: React.FC<TrendingVibesProps> = ({
  vibes = defaultVibes,
  onSelectVibe = () => {},
}) => {
  return (
    <Card className="w-full max-w-[350px] bg-black/20 backdrop-blur-sm border-none shadow-lg">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-3 text-white">
          Trending Vibes
        </h3>
        <div className="flex flex-wrap gap-2">
          {vibes.map((vibe) => (
            <motion.div
              key={vibe.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectVibe(vibe)}
            >
              <Badge
                className="cursor-pointer py-2 px-3 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${vibe.color}, ${vibe.secondaryColor})`,
                  boxShadow: `0 0 10px ${vibe.color}80`,
                }}
              >
                {vibe.name}
                <span className="ml-1 opacity-70 text-xs">({vibe.count})</span>
              </Badge>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendingVibes;
