import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import OutputCard from "../components/OutputCard";
import API from "../utils/api";

export default function History() {
  const [generations, setGenerations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await API.get("/history");
        setGenerations(data.generations);
      } catch (err) {
        console.error("Failed to fetch history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await API.delete(`/history/${id}`);
      setGenerations(generations.filter((g) => g._id !== id));
    } catch (err) {
      console.error("Failed to delete");
    }
  };

  const typeLabels = { blog: "Blog Post", linkedin: "LinkedIn", email: "Cold Email" };
  const toneLabels = { professional: "💼 Professional", casual: "😊 Casual", funny: "😂 Funny", "gen-z": "🔥 Gen-Z" };

  return (
    return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="w-full lg:ml-64 flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">History</h1>
            <p className="text-zinc-500 mt-1">All your past generations</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : generations.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-zinc-500 text-lg">No generations yet</p>
              <p className="text-zinc-600 text-sm mt-1">Go generate some content first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {generations.map((gen) => (
                <div key={gen._id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  {/* Card Header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-800 transition-colors"
                    onClick={() => setExpanded(expanded === gen._id ? null : gen._id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs px-2.5 py-1 rounded-full">
                        {typeLabels[gen.outputType]}
                      </span>
                      <span className="text-xs text-zinc-500">{toneLabels[gen.tone]}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-600">
                        {new Date(gen.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(gen._id); }}
                        className="text-zinc-600 hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <svg
                        className={`w-4 h-4 text-zinc-500 transition-transform ${expanded === gen._id ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Topic */}
                  <div className="px-4 pb-3">
                    <p className="text-sm text-white font-medium truncate">{gen.topic}</p>
                  </div>

                  {/* Expanded Content */}
                  {expanded === gen._id && (
                    <div className="px-4 pb-4 border-t border-zinc-800 pt-4">
                      <OutputCard generation={gen} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}