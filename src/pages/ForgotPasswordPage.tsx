import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/GlassCard";
import AnimatedBackground from "@/components/AnimatedBackground";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleReset() {
    setError("");
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <AnimatedBackground />
      <div className="relative z-10 w-full max-w-[420px] animate-scale-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">CryptoChat</h1>
          </div>
          <p className="text-sm text-muted-foreground">Reset your password</p>
        </div>

        <GlassCard className="rounded-3xl p-8 space-y-6">
          {sent ? (
            <>
              <p className="text-foreground text-sm leading-relaxed">
                📬 Check your email. A reset link has been sent to <strong>{email}</strong>. It expires
                in 1 hour.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="reset-email" className="text-xs text-muted-foreground mb-2 block">
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="you@example.com"
                  className={cn(
                    "w-full bg-transparent glass rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    error && "ring-2 ring-destructive/50",
                  )}
                />
                {error && <p className="text-xs text-destructive mt-2">{error}</p>}
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => void handleReset()}
                className="w-full py-3 rounded-xl font-medium text-sm bg-gradient-to-r from-primary to-primary/80 text-primary-foreground disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground w-full justify-center"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </button>
            </>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
