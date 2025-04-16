import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Zap, Users, Music } from "lucide-react";
import { Link } from "react-router-dom";
import VibeFeed from "./VibeFeed";
import TrendingVibes from "./TrendingVibes";
import VibeCreator from "./VibeCreator";

const Home = () => {
  const [selectedMood, setSelectedMood] = useState("chill");
  const [showVibeCreator, setShowVibeCreator] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");

  // Background gradient based on selected mood
  const moodGradients = {
    chill: "bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900",
    energetic: "bg-gradient-to-br from-orange-600 via-red-500 to-pink-600",
    melancholy: "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800",
    hopeful: "bg-gradient-to-br from-emerald-700 via-teal-600 to-cyan-700",
    chaotic: "bg-gradient-to-br from-fuchsia-700 via-purple-600 to-pink-700",
    villain: "bg-gradient-to-br from-slate-900 via-red-900 to-slate-800",
    nostalgic: "bg-gradient-to-br from-amber-700 via-yellow-600 to-orange-600",
  };

  const handleMoodChange = (mood) => {
    setSelectedMood(mood);
  };

  const toggleVibeCreator = () => {
    setShowVibeCreator(!showVibeCreator);
  };

  return (
    <div
      className={`min-h-screen ${moodGradients[selectedMood]} text-white transition-all duration-1000`}
    >
      {/* App Header */}
      <header className="p-4 flex justify-between items-center">
        <motion.h1
          className="text-3xl font-bold tracking-wider"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          VYBZ
        </motion.h1>
        <div className="flex gap-2">
          <Link to="/tempobook/storyboards/46abdc41-461d-4854-a29b-443a68d4834b">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all mr-2"
            >
              <Music className="h-6 w-6" />
            </motion.button>
          </Link>
          <Link to="/tempobook/storyboards/46abdc41-461d-4854-a29b-443a68d4834b">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
            >
              <Plus className="h-6 w-6" />
            </motion.button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-20">
        {/* Trending Vibes Section */}
        <section className="mb-6">
          <TrendingVibes
            onSelectMood={handleMoodChange}
            selectedMood={selectedMood}
          />
        </section>

        {/* Vibe Feed */}
        <section className="relative">
          <VibeFeed mood={selectedMood} />
        </section>
      </main>

      {/* Bottom Navigation */}
      <motion.nav
        className="fixed bottom-0 left-0 right-0 bg-black/30 backdrop-blur-md p-4 flex justify-around items-center border-t border-white/10"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <button
          className={`flex flex-col items-center ${activeTab === "feed" ? "text-white" : "text-white/60"}`}
          onClick={() => setActiveTab("feed")}
        >
          <Zap className="h-6 w-6 mb-1" />
          <span className="text-xs">Feed</span>
        </button>
        <Link to="/tempobook/storyboards/46abdc41-461d-4854-a29b-443a68d4834b">
          <button className="flex flex-col items-center text-white/60">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Plus className="h-6 w-6" />
            </div>
          </button>
        </Link>
        <button
          className={`flex flex-col items-center ${activeTab === "connections" ? "text-white" : "text-white/60"}`}
          onClick={() => setActiveTab("connections")}
        >
          <Users className="h-6 w-6 mb-1" />
          <span className="text-xs">Syncs</span>
        </button>
      </motion.nav>

      {/* Vibe Creator Modal */}
      {showVibeCreator && (
        <VibeCreator
          isOpen={showVibeCreator}
          onClose={toggleVibeCreator}
          selectedMood={selectedMood}
          onMoodChange={handleMoodChange}
        />
      )}
    </div>
  );
};

export default Home;
