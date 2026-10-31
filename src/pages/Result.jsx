import { motion } from "framer-motion";

function ScoreBar({ label, score, color }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-white font-bold">{score}/10</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-2 rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function Result({ scores, topic, setPage, setMessages }) {
  if (!scores) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">No scores available.</p>
      </div>
    );
  }

  const humanTotal = scores.human.logic + scores.human.clarity + scores.human.persuasion;
  const aiTotal = scores.ai.logic + scores.ai.clarity + scores.ai.persuasion;
  const userWon = scores.winner?.toLowerCase().includes("human");
  const allMessages = scores.messages || [];

  // Split messages into rounds
  const rounds = [];
  let currentRound = [];
  allMessages.forEach((msg) => {
    currentRound.push(msg);
    if (msg.role === "ai") {
      rounds.push(currentRound);
      currentRound = [];
    }
  });

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl mx-auto">

      {/* Winner Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="text-7xl mb-3">{userWon ? "🏆" : "🤖"}</div>
        <h1 className={`text-5xl font-bold mb-2 ${userWon ? "text-indigo-400" : "text-purple-400"}`}>
          {userWon ? "You Won!" : "AI Won!"}
        </h1>
        <p className="text-slate-400 text-sm max-w-sm mx-auto mt-2">{scores.reason}</p>
        <p className="text-slate-600 text-xs mt-1">Topic: "{topic}"</p>
      </motion.div>

      {/* Score Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`bg-[#1E293B] rounded-2xl p-5 border ${userWon ? "border-indigo-500" : "border-slate-700"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">👤 You</h3>
            <span className="text-2xl font-bold text-indigo-400">{humanTotal}/30</span>
          </div>
          <ScoreBar label="Logic" score={scores.human.logic} color="bg-indigo-500" />
          <ScoreBar label="Clarity" score={scores.human.clarity} color="bg-blue-500" />
          <ScoreBar label="Persuasion" score={scores.human.persuasion} color="bg-cyan-500" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`bg-[#1E293B] rounded-2xl p-5 border ${!userWon ? "border-purple-500" : "border-slate-700"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold">🤖 AI</h3>
            <span className="text-2xl font-bold text-purple-400">{aiTotal}/30</span>
          </div>
          <ScoreBar label="Logic" score={scores.ai.logic} color="bg-purple-500" />
          <ScoreBar label="Clarity" score={scores.ai.clarity} color="bg-pink-500" />
          <ScoreBar label="Persuasion" score={scores.ai.persuasion} color="bg-rose-500" />
        </motion.div>
      </div>

      {/* Round by Round */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-white font-bold text-lg mb-4">📋 Round Summary</h2>
        {rounds.map((round, ri) => (
          <div key={ri} className="mb-4 bg-[#1E293B] rounded-2xl p-4 border border-slate-700">
            <div className="text-indigo-400 font-bold text-sm mb-3">
              🥊 Round {ri + 1}
            </div>
            {round.map((msg, mi) => (
              <div
                key={mi}
                className={`mb-2 p-3 rounded-xl text-sm ${
                  msg.role === "user"
                    ? "bg-indigo-600/20 border border-indigo-600/30 text-slate-200"
                    : "bg-purple-600/20 border border-purple-600/30 text-slate-200"
                }`}
              >
                <div className="text-xs opacity-50 mb-1">
                  {msg.role === "user" ? "👤 You" : "🤖 AI"}
                </div>
                {msg.text}
              </div>
            ))}
          </div>
        ))}
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="flex gap-3"
      >
        <button
          onClick={() => { setMessages([]); setPage("home"); }}
          className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition"
        >
          🔄 Debate Again
        </button>
        <button
          onClick={() => { setMessages([]); setPage("home"); }}
          className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-400 font-semibold hover:border-indigo-500 hover:text-indigo-400 transition"
        >
          🏠 Home
        </button>
      </motion.div>
    </div>
  );
}

export default Result;