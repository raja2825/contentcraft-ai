import { useState } from "react";
import PricingModal from "./PricingModal";

export default function UsageBanner({ used, limit }) {
  const [showModal, setShowModal] = useState(false);
  const remaining = limit - used;

  if (remaining > 2) return null;

  return (
    <>
      <div className={`rounded-xl border p-4 mb-6 flex items-center justify-between ${
        remaining === 0 ? "bg-red-950 border-red-800" : "bg-yellow-950 border-yellow-800"
      }`}>
        <div>
          <p className={`font-semibold text-sm ${remaining === 0 ? "text-red-400" : "text-yellow-400"}`}>
            {remaining === 0
              ? "⛔ You've used all your free generations"
              : `⚠️ Only ${remaining} free generation${remaining === 1 ? "" : "s"} left`}
          </p>
          <p className="text-zinc-400 text-xs mt-0.5">Upgrade to Pro for 100 generations/month</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-zinc-900 text-sm font-bold px-4 py-2 rounded-lg hover:bg-zinc-200 transition-all whitespace-nowrap ml-4"
        >
          Upgrade ⚡
        </button>
      </div>
      {showModal && <PricingModal onClose={() => setShowModal(false)} />}
    </>
  );
}