const tones = [
  { id: "professional", label: "Professional", emoji: "💼" },
  { id: "casual", label: "Casual", emoji: "😊" },
  { id: "funny", label: "Funny", emoji: "😂" },
  { id: "gen-z", label: "Gen-Z", emoji: "🔥" },
];

export default function ToneSelector({ selected, onChange }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {tones.map((tone) => (
        <button
          key={tone.id}
          onClick={() => onChange(tone.id)}
          className={`flex flex-col items-center gap-1 py-3 px-2 rounded-lg border text-sm font-medium transition-all ${
            selected === tone.id
              ? "border-white bg-white text-zinc-900"
              : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white"
          }`}
        >
          <span className="text-lg">{tone.emoji}</span>
          <span className="text-xs">{tone.label}</span>
        </button>
      ))}
    </div>
  );
}