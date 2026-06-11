import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";

export default function Login() {
  const [step, setStep] = useState(1); // 1=credentials, 2=otp
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

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
      await API.post("/auth/login/send-otp", { email, password });
      setStep(2);
      startTimer();
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
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
      const { data } = await API.post("/auth/login/verify-otp", { email, otp });
      updateUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await API.post("/auth/login/send-otp", { email, password });
      startTimer();
      setError("");
    } catch (err) {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-white">
            Content<span className="text-zinc-400">Craft</span>
          </Link>
          <p className="text-zinc-500 mt-2 text-sm">Welcome back</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s ? "bg-green-500 text-white" :
                  step === s ? "bg-white text-zinc-900" :
                  "bg-zinc-800 text-zinc-500"
                }`}>
                  {step > s ? "✓" : s}
                </div>
                {s < 2 && <div className={`h-px w-8 ${step > s ? "bg-green-500" : "bg-zinc-700"}`}></div>}
              </div>
            ))}
            <span className="text-zinc-500 text-xs ml-2">
              {step === 1 ? "Your credentials" : "Verify email"}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white mb-6">
            {step === 1 ? "Sign in to your account" : "Verify your email"}
          </h2>

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Step 1 — Email + Password */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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
                {loading ? "Verifying..." : "Verify & Sign in →"}
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

          <p className="text-center text-zinc-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-white hover:underline font-medium">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}