import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ToneSelector from "../components/ToneSelector";
import OutputCard from "../components/OutputCard";
import UsageBanner from "../components/UsageBanner";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

const outputTypes = [
  { id: "blog", label: "Blog Post", icon: "📝" },
  { id: "linkedin", label: "LinkedIn", icon: "💼" },
  { id: "email", label: "Cold Email", icon: "📧" },
];

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [outputType, setOutputType] = useState("blog");
  const [generation, setGeneration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) return setError("Please enter a topic");
    setError("");
    setLoading(true);
    setGeneration(null);
    try {
      const { data } = await API.post("/generate", { topic, tone, outputType });
      setGeneration(data.generation);
      updateUser({
        ...user,
        generationsUsed: data.usage.generationsUsed,
      });
    } catch (err) {
      if (err.response?.data?.limitReached) {
        setError("You've reached your free limit. Upgrade to Pro to continue.");
      } else {
        setError(err.response?.data?.message || "Generation failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
   return (
    <div className="flex min-h-screen bg-zinc-950">
      <Sidebar />

      {/* Main Content */}
      <main className="w-full lg:ml-64 flex-1 p-4 lg:p-8 pt-16 lg:pt-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Generate Content</h1>
            <p className="text-zinc-500 mt-1">
              Paste your topic or notes and let AI do the writing
            </p>
          </div>

          {/* Usage Banner */}
          <UsageBanner
            used={user?.generationsUsed || 0}
            limit={user?.generationsLimit || 5}
          />

          {/* Form Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">

            {/* Topic Input */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Topic or Notes
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Benefits of waking up at 5am, productivity tips for remote workers..."
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors resize-none"
              />
            </div>

            {/* Output Type */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Content Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {outputTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setOutputType(type.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      outputType === type.id
                        ? "border-white bg-white text-zinc-900"
                        : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    <span>{type.icon}</span>
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selector */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Tone
              </label>
              <ToneSelector selected={tone} onChange={setTone} />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="w-full bg-white text-zinc-900 font-bold py-3 rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <span>⚡</span>
                  Generate Content
                </>
              )}
            </button>
          </div>

          {/* Output */}
          {generation && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-white mb-3">Generated Content</h2>
              <OutputCard generation={generation} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}