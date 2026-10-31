import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const ROUNDS = 3;

async function callAI(prompt, isJudge = false) {
  const systemMsg = isJudge
    ? "You are a strict and fair debate judge. Reply ONLY in the exact format given. No extra text."
    : "You are a debate opponent. Reply with ONLY 2-3 complete short sentences as your counter-argument. No thinking, no markdown, no explanation.";

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      max_tokens: 600,
      reasoning_effort: "low",
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: prompt },
      ],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.choices?.[0]?.message?.content || "";
  return text.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}

function Debate({ topic, setPage, messages, setMessages, setScores }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(1);
  const [userTurn, setUserTurn] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showQuit, setShowQuit] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async () => {
    const userMsg = input.trim();
    if (!userMsg || hasSubmitted) return;

    setHasSubmitted(true);
    setUserTurn(false);
    setInput("");
    setLoading(true);

    const newMessages = [...messages, { role: "user", text: userMsg }];
    setMessages(newMessages);

    const history = newMessages
      .map((m) => `${m.role === "user" ? "Human" : "AI"}: ${m.text}`)
      .join("\n");

    const prompt = `Topic: "${topic}". You are AGAINST this.\nConversation:\n${history}\nYour counter-argument:`;

    try {
      let aiReply = await callAI(prompt, false);
      if (!aiReply) {
        aiReply = await callAI(prompt, false);
      }
      if (!aiReply) {
        aiReply = "I strongly disagree with this point and believe the opposite is true.";
      }

      const updatedMessages = [...newMessages, { role: "ai", text: aiReply }];
      setMessages(updatedMessages);

      if (round >= ROUNDS) {
        await getScores(updatedMessages);
      } else {
        setRound((r) => r + 1);
        setHasSubmitted(false);
        setUserTurn(true);
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Error: " + e.message },
      ]);
      setHasSubmitted(false);
      setUserTurn(true);
    }
    setLoading(false);
  };

  const parseScores = (text) => {
    const clean = text.replace(/\*/g, "");
    const num = (label) => {
      const m = clean.match(new RegExp(label + "\\s*:\\s*(\\d+)", "i"));
      return m ? Math.min(10, parseInt(m[1], 10)) : null;
    };
    const values = {
      hl: num("Human Logic"),
      hc: num("Human Clarity"),
      hp: num("Human Persuasion"),
      al: num("AI Logic"),
      ac: num("AI Clarity"),
      ap: num("AI Persuasion"),
    };
    if (Object.values(values).some((v) => v === null)) return null;
    const reasonMatch = clean.match(/Reason\s*:\s*(.+)/i);
    return {
      values,
      reason: reasonMatch ? reasonMatch[1].trim() : "",
    };
  };

  const getScores = async (finalMessages) => {
    const history = finalMessages
      .map((m) => `${m.role === "user" ? "Human" : "AI"}: ${m.text}`)
      .join("\n");

    const prompt = `You are judging a debate on the topic: "${topic}".
The Human argued FOR the topic. The AI argued AGAINST it.

Full debate:
${history}

Score each side from 1 to 10 for Logic, Clarity and Persuasion.
Be strict: very short, low-effort or off-topic replies (like "ok" or "yes") must get low scores (1-3).
Strong, well-explained arguments get 7-10. Scores do NOT have to be equal.

Reply in this exact format only:
Human Logic: X
Human Clarity: X
Human Persuasion: X
AI Logic: X
AI Clarity: X
AI Persuasion: X
Reason: one short line explaining who argued better`;

    let parsed = null;
    for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
      try {
        const result = await callAI(prompt, true);
        parsed = parseScores(result);
      } catch (e) {
        parsed = null;
      }
    }

    if (!parsed) {
      parsed = {
        values: { hl: 5, hc: 5, hp: 5, al: 5, ac: 5, ap: 5 },
        reason: "Scores could not be generated. Please try again.",
      };
    }

    const { hl, hc, hp, al, ac, ap } = parsed.values;
    const humanTotal = hl + hc + hp;
    const aiTotal = al + ac + ap;
    // Winner is decided by total score. Tie goes to Human.
    const winner = humanTotal >= aiTotal ? "Human" : "AI";

    setScores({
      human: { logic: hl, clarity: hc, persuasion: hp },
      ai: { logic: al, clarity: ac, persuasion: ap },
      winner,
      reason: parsed.reason || (winner === "Human" ? "You argued better!" : "AI argued better."),
      messages: finalMessages,
    });
    setPage("result");
  };

  return (
    <div className="h-screen flex flex-col max-w-2xl mx-auto px-4 py-4 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowQuit(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white transition"
          >
            ←
          </button>
          <div>
            <h2 className="text-lg font-bold text-white">⚔️ DebateMe</h2>
            <p className="text-slate-400 text-xs truncate max-w-[200px]">"{topic}"</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-500 mb-1">Round {round}/{ROUNDS}</div>
          <div className="flex gap-1">
            {Array.from({ length: ROUNDS }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-7 rounded-full transition-all ${
                  i < round - 1
                    ? "bg-indigo-500"
                    : i === round - 1
                    ? "bg-indigo-400 animate-pulse"
                    : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sides Banner */}
      <div className="flex gap-2 mb-3 flex-shrink-0">
        <div className="flex-1 bg-indigo-600/20 border border-indigo-600/40 rounded-xl py-2 text-center text-xs text-indigo-300 font-semibold">
          👤 You — FOR
        </div>
        <div className="flex-1 bg-purple-600/20 border border-purple-600/40 rounded-xl py-2 text-center text-xs text-purple-300 font-semibold">
          🤖 AI — AGAINST
        </div>
      </div>

      {/* Round Badge */}
      <div className="text-center mb-3 flex-shrink-0">
        <span className="bg-indigo-600/30 text-indigo-300 text-xs px-4 py-1 rounded-full border border-indigo-600/40">
          🥊 Round {round} of {ROUNDS}
        </span>
      </div>

      {/* Chat */}
      <div ref={chatRef} className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
        {messages.length === 0 && (
          <div className="text-center text-slate-500 text-sm mt-10">
            🗣️ Type your first argument to start!
          </div>
        )}
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-[#1E293B] text-slate-200 rounded-bl-none border border-slate-700"
                }`}
              >
                <div className="text-xs mb-1 opacity-50">
                  {msg.role === "user" ? "👤 You (FOR)" : "🤖 AI (AGAINST)"}
                </div>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-[#1E293B] border border-slate-700 px-4 py-3 rounded-2xl rounded-bl-none text-slate-400 text-sm flex items-center gap-2">
              <span className="animate-spin inline-block">⚙️</span>
              {round >= ROUNDS && messages.length >= ROUNDS * 2 - 1
                ? "Judging the debate..."
                : "AI is thinking..."}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      {userTurn && !loading && (
        <div className="flex gap-2 flex-shrink-0">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Type your argument here... (Enter to send)"
            rows={2}
            className="flex-1 bg-[#1E293B] text-white border border-slate-600 rounded-xl p-3 text-sm resize-none outline-none focus:border-indigo-500 transition"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="px-4 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-40"
          >
            Send ➤
          </button>
        </div>
      )}

      {!userTurn && loading && (
        <div className="text-center text-slate-400 text-sm py-3 flex-shrink-0">
          ⏳ Please wait...
        </div>
      )}

      {/* Quit Modal */}
      {showQuit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1E293B] rounded-2xl p-6 w-full max-w-sm border border-slate-700"
          >
            <h3 className="text-white font-bold text-lg mb-2">Quit Debate? 🚪</h3>
            <p className="text-slate-400 text-sm mb-5">Progress lost ho jayegi!</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setMessages([]); setPage("home"); }}
                className="flex-1 py-2 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                Quit
              </button>
              <button
                onClick={() => setShowQuit(false)}
                className="flex-1 py-2 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:border-indigo-500 transition"
              >
                Continue
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Debate;