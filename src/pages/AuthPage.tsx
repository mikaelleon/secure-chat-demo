import { useState } from "react";
import { Lock, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/GlassCard";
import AnimatedBackground from "@/components/AnimatedBackground";

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage = ({ onLogin }: AuthPageProps) => {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    if (tab === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => onLogin(), 800);
    }, 1500);
  };

  const inputClass = cn(
    "w-full bg-transparent glass rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 transition-all duration-300",
    tab === "login" ? "focus:ring-primary/50" : "focus:ring-secondary/50"
  );

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-[420px] animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">CryptoChat</h1>
          </div>
          <p className="text-sm text-muted-foreground">End-to-end encryption demo</p>
        </div>

        <GlassCard className={cn("rounded-3xl p-8", shake && "animate-shake")}>
          {/* Tab switcher */}
          <div className="relative flex glass rounded-full p-1 mb-8">
            <div
              className={cn(
                "absolute top-1 bottom-1 rounded-full transition-all duration-500",
                tab === "login"
                  ? "left-1 bg-primary/20 border border-primary/30"
                  : "bg-secondary/20 border border-secondary/30"
              )}
              style={{
                width: "calc(50% - 4px)",
                transform: tab === "login" ? "translateX(0)" : "translateX(calc(100% + 4px))",
              }}
            />
            <button
              onClick={() => { setTab("login"); setError(""); }}
              className={cn(
                "relative z-10 flex-1 py-2 text-sm font-medium rounded-full transition-colors duration-300",
                tab === "login" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Log In
            </button>
            <button
              onClick={() => { setTab("signup"); setError(""); }}
              className={cn(
                "relative z-10 flex-1 py-2 text-sm font-medium rounded-full transition-colors duration-300",
                tab === "signup" ? "text-secondary" : "text-muted-foreground"
              )}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "signup" && (
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className={inputClass}
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(inputClass, error && !email && "ring-2 ring-destructive/50")}
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(inputClass, "pr-10", error && !password && "ring-2 ring-destructive/50")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {tab === "signup" && (
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            {tab === "login" && (
              <div className="text-right">
                <button type="button" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            {error && <p className="text-xs text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading || success}
              className={cn(
                "w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 disabled:opacity-70",
                tab === "login"
                  ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:shadow-lg hover:shadow-primary/20"
                  : "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:shadow-lg hover:shadow-secondary/20"
              )}
            >
              {success ? (
                <Check className="w-5 h-5 mx-auto animate-scale-in" />
              ) : loading ? (
                <Loader2 className="w-5 h-5 mx-auto animate-spin" />
              ) : tab === "login" ? (
                "Log In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </GlassCard>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Your messages are encrypted. We never store plain text.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
