import { useState } from "react";
import Home from "./pages/Home";
import Debate from "./pages/Debate";
import Result from "./pages/Result";

function App() {
  const [page, setPage] = useState("home");
  const [topic, setTopic] = useState("");
  const [messages, setMessages] = useState([]);
  const [scores, setScores] = useState(null);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      {page === "home" && (
        <Home
          setPage={setPage}
          setTopic={setTopic}
        />
      )}
      {page === "debate" && (
        <Debate
          topic={topic}
          setPage={setPage}
          messages={messages}
          setMessages={setMessages}
          setScores={setScores}
        />
      )}
      {page === "result" && (
        <Result
          scores={scores}
          topic={topic}
          setPage={setPage}
          setMessages={setMessages}
        />
      )}
    </div>
  );
}

export default App;