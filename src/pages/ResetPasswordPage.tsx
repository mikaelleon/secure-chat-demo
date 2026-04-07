import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/GlassCard";
import AnimatedBackground from "@/components/AnimatedBackground";
import { supabase } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setValidSession(true);
      if (session && event === "PASSWORD_RECOVERY") setValidSession(true);
    });

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) setValidSession(true);
      setChecking(false);
    })();

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function handleUpdatePassword() {
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate("/login"), 2500);
  }

  const inputClass =
    "w-full bg-transparent glass rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10";

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (!validSession) {
    return (
      <div className="min-h-screen flex items-center justify-center relative p-4">
        <AnimatedBackground />
        <GlassCard className="relative z-10 max-w-md rounded-3xl p-8 text-center space-y-4">
          <Lock className="w-10 h-10 text-muted-foreground mx-auto" />
          <p className="text-foreground">This link is invalid or has expired. Request a new one.</p>
          <button
            type="button"
            onClick={() => navigate("/forgot-password")}
            className="text-primary text-sm hover:underline"
          >
            Forgot password
          </button>
        </GlassCard>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center relative p-4">
        <AnimatedBackground />
        <GlassCard className="relative z-10 max-w-md rounded-3xl p-8 text-center">
          <p className="text-foreground">✅ Password updated. Redirecting to login…</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-[420px] animate-scale-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">New password</h1>
          </div>
          <p className="text-sm text-muted-foreground">Choose a strong password</p>
        </div>

        <GlassCard className="rounded-3xl p-8 space-y-4">
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(inputClass)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(inputClass)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleUpdatePassword()}
            className="w-full py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-primary to-primary/80 text-primary-foreground disabled:opacity-50 flex justify-center"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Password"}
          </button>
        </GlassCard>
      </div>
    </div>
  );
}
