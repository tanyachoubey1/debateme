import { useState } from "react";
import { motion } from "framer-motion";

const randomTopics = [
  "Social media does more harm than good",
  "AI will replace human jobs",
  "Online education is better than offline",
  "Cryptocurrency is the future of money",
  "Space exploration is a waste of money",
  "Exams should be abolished",
  "Vegetarianism should be mandatory",
  "Work from home is more productive",
];

function Home({ setPage, setTopic }) {
  const [input, setInput] = useState("");

  const handleRandom = () => {
    const random = randomTopics[Math.floor(Math.random() * randomTopics.length)];
    setInput(random);
  };

  const handleStart = () => {
    if (!input.trim()) return;
    setTopic(input.trim());
    setPage("debate");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <div className="text-6xl mb-4">🗣️</div>
        <h1 className="text-5xl font-bold text-white mb-2">DebateMe</h1>
        <p className="text-slate-400 text-lg">
          Debate any topic. Challenge AI. Get scored.
        </p>
      </motion.div>

      {/* Input Box */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full max-w-xl"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a debate topic..."
          rows={3}
          className="w-full bg-[#1E293B] text-white border border-slate-600 rounded-2xl p-4 text-base resize-none outline-none focus:border-indigo-500 transition"
        />

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleRandom}
            className="flex-1 py-3 rounded-xl border border-indigo-500 text-indigo-400 font-semibold hover:bg-indigo-500 hover:text-white transition"
          >
            🎲 Random Topic
          </button>
          <button
            onClick={handleStart}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Start Debate 🚀
          </button>
        </div>
      </motion.div>

      {/* Tags */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-wrap gap-2 mt-8 justify-center max-w-xl"
      >
        {randomTopics.slice(0, 4).map((t, i) => (
          <button
            key={i}
            onClick={() => setInput(t)}
            className="text-xs bg-[#1E293B] text-slate-400 px-3 py-1 rounded-full border border-slate-700 hover:border-indigo-500 hover:text-indigo-400 transition"
          >
            {t}
          </button>
        ))}
      </motion.div>

    </div>
  );
}

export default Home;