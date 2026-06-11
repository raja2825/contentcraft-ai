import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

export default function Signup() {
  const [step, setStep] = useState(1); // 1=details, 2=otp, 3=password
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  // Start resend countdown
  const startTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  // Step 1 — Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.post("/auth/signup/send-otp", { name, email });
      setStep(2);
      startTimer();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.post("/auth/signup/verify-otp", { email, otp });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 3 — Complete Signup
  const handleComplete = async (e) => {
  e.preventDefault();
  setError("");
  if (password !== confirm) {
    return setError("Passwords don't match");
  }
  setLoading(true);
  try {
    const { data } = await API.post("/auth/signup/complete", { email, password });
    updateUser(data.user); // ← update auth context with user
    navigate("/dashboard");
  } catch (err) {
    setError(err.response?.data?.message || "Signup failed");
  } finally {
    setLoading(false);
  }
};

  // Resend OTP
  const handleResend = async () => {
    try {
      await API.post("/auth/signup/send-otp", { name, email });
      startTimer();
      setError("");
    } catch (err) {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-white">
            Content<span className="text-zinc-400">Craft</span>
          </Link>
          <p className="text-zinc-500 mt-2 text-sm">Start generating for free</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s ? "bg-green-500 text-white" :
                  step === s ? "bg-white text-zinc-900" :
                  "bg-zinc-800 text-zinc-500"
                }`}>
                  {step > s ? "✓" : s}
                </div>
                {s < 3 && <div className={`h-px w-8 ${step > s ? "bg-green-500" : "bg-zinc-700"}`}></div>}
              </div>
            ))}
            <span className="text-zinc-500 text-xs ml-2">
              {step === 1 ? "Your details" : step === 2 ? "Verify email" : "Set password"}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white mb-6">
            {step === 1 ? "Create your account" :
             step === 2 ? "Verify your email" :
             "Set your password"}
          </h2>

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Step 1 — Name + Email */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rajas"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-zinc-900 font-bold py-2.5 rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50 mt-2"
              >
                {loading ? "Sending OTP..." : "Continue →"}
              </button>
            </form>
          )}

          {/* Step 2 — OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-300">
                ✉️ OTP sent to <span className="text-white font-medium">{email}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="_ _ _ _ _ _"
                  required
                  maxLength={6}
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors text-center text-xl tracking-widest"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-white text-zinc-900 font-bold py-2.5 rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify OTP →"}
              </button>
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-zinc-500 text-sm">Resend OTP in {resendTimer}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-zinc-400 hover:text-white text-sm transition-colors"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Step 3 — Password */}
          {step === 3 && (
            <form onSubmit={handleComplete} className="space-y-4">
              <div className="bg-green-950 border border-green-800 text-green-400 text-sm px-4 py-3 rounded-lg">
                ✅ Email verified — {email}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-zinc-900 font-bold py-2.5 rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50"
              >
                {loading ? "Creating account..." : "Create Account ⚡"}
              </button>
            </form>
          )}

          <p className="text-center text-zinc-500 text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-white hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}