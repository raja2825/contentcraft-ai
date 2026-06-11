import { useState } from "react";

export default function OutputCard({ generation }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(generation.generatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const typeLabels = { blog: "Blog Post", linkedin: "LinkedIn", email: "Cold Email" };
  const toneLabels = { professional: "💼", casual: "😊", funny: "😂", "gen-z": "🔥" };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-zinc-800 text-zinc-300 text-xs px-2.5 py-1 rounded-full font-medium">
            {typeLabels[generation.outputType]}
          </span>
          <span className="text-sm">{toneLabels[generation.tone]}</span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            copied
              ? "bg-green-500 text-white"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
          }`}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-300 leading-relaxed">
          {generation.generatedContent}
        </pre>
      </div>
    </div>
  );
}