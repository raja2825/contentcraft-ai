import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    generations: 5,
    features: ["5 generations/month", "Blog, LinkedIn, Email", "4 tones", "History"],
    cta: "Current Plan",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹1",
    period: "/month",
    generations: 100,
    features: ["100 generations/month", "Blog, LinkedIn, Email", "4 tones", "Full history", "Priority support"],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    id: "business",
    name: "Business",
    price: "₹2",
    period: "/month",
    generations: 500,
    features: ["500 generations/month", "Blog, LinkedIn, Email", "4 tones", "Full history", "Priority support", "Team access (soon)"],
    cta: "Upgrade to Business",
    highlight: false,
  },
];

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) { resolve(true); return; }
    const script = document.createElement("script");
    script.id = "razorpay-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function PricingModal({ onClose }) {
  const { user, updateUser } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [error, setError] = useState("");

  const handleUpgrade = async (plan) => {
    if (plan.id === "free" || user?.plan === plan.id) return;
    setError("");
    setLoadingPlan(plan.id);

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Failed to load payment gateway. Check your internet connection.");
        setLoadingPlan(null);
        return;
      }

      const { data } = await API.post("/payment/create-order", { plan: plan.id });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ContentCraft",
        description: `${data.label} Plan — ${plan.generations} generations/month`,
        order_id: data.orderId,
        handler: async (response) => {
          try {
            const { data: verifyData } = await API.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan: plan.id,
            });
            updateUser(verifyData.user);
            onClose();
            alert(`🎉 ${verifyData.message}`);
          } catch (err) {
            setError(err.response?.data?.message || "Payment verification failed");
          }
        },
        prefill: { name: user?.name || "", email: user?.email || "" },
        theme: { color: "#18181b" },
        modal: { ondismiss: () => setLoadingPlan(null) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoadingPlan(null);
      });
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors text-xl leading-none">✕</button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Choose your plan</h2>
          <p className="text-zinc-400 text-sm mt-2">Upgrade anytime. Usage resets to 0 on each upgrade.</p>
        </div>

        {error && (
          <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        <div className="grid grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const isCurrent = user?.plan === plan.id;
            const isLoading = loadingPlan === plan.id;
            return (
              <div key={plan.id} className={`relative rounded-xl border p-5 flex flex-col ${plan.highlight ? "border-white bg-zinc-800" : "border-zinc-700 bg-zinc-900"}`}>
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-zinc-900 text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
                )}
                <div className="mb-4">
                  <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-zinc-400 text-sm">{plan.period}</span>
                  </div>
                  <p className="text-zinc-500 text-xs mt-1">{plan.generations} generations/month</p>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-zinc-300 text-xs">
                      <span className="text-green-400">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isCurrent || plan.id === "free" || isLoading}
                  className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                    isCurrent || plan.id === "free"
                      ? "bg-zinc-700 text-zinc-500 cursor-default"
                      : plan.highlight
                      ? "bg-white text-zinc-900 hover:bg-zinc-200"
                      : "bg-zinc-700 text-white hover:bg-zinc-600"
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {isLoading ? (
                    <><div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />Processing...</>
                  ) : isCurrent ? "✓ Current Plan" : plan.cta}
                </button>
              </div>
            );
          })}
        </div>
        <p className="text-center text-zinc-600 text-xs mt-6">Secure payments powered by Razorpay</p>
      </div>
    </div>
  );
}