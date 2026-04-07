import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/GlassCard";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useAuthContext } from "@/context/AuthContext";

function mapLoginErrorMessage(raw: string): string {
  const m = raw.toLowerCase();
  if (m.includes("invalid login credentials")) return "Incorrect email or password";
  if (m.includes("email not confirmed")) return "Please verify your email first";
  if (m.includes("too many requests")) return "Too many attempts. Try again later.";
  return raw;
}

export type AuthPageProps = {
  defaultTab: "login" | "register";
};

const AuthPage = ({ defaultTab }: AuthPageProps) => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthContext();

  const [tab, setTab] = useState<"login" | "signup">(defaultTab === "register" ? "signup" : "login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [fieldErrors, setFieldErrors] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setTab(defaultTab === "register" ? "signup" : "login");
  }, [defaultTab]);

  useEffect(() => {
    if (!success || tab !== "signup") return;
    const t = setTimeout(() => navigate("/login"), 2000);
    return () => clearTimeout(t);
  }, [success, tab, navigate]);

  const inputClass = cn(
    "w-full bg-transparent glass rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground",
    "focus:outline-none focus:ring-2 transition-all duration-300",
    tab === "login" ? "focus:ring-primary/50" : "focus:ring-secondary/50",
  );

  const clearField = (key: keyof typeof fieldErrors) => {
    setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({ displayName: "", email: "", password: "", confirmPassword: "" });

    let hasErr = false;
    const next = { displayName: "", email: "", password: "", confirmPassword: "" };
    if (!email.trim()) {
      next.email = "Email is required";
      hasErr = true;
    } else if (!email.includes("@")) {
      next.email = "Enter a valid email";
      hasErr = true;
    }
    if (!password) {
      next.password = "Password is required";
      hasErr = true;
    }
    if (hasErr) {
      setFieldErrors(next);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    const { error: signErr } = await signIn(email.trim(), password);
    if (signErr) {
      setError(mapLoginErrorMessage(signErr.message));
      setLoading(false);
      return;
    }
    navigate("/chat");
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const next = { displayName: "", email: "", password: "", confirmPassword: "" };
    let hasErr = false;

    if (!displayName.trim()) {
      next.displayName = "Display name is required";
      hasErr = true;
    } else if (displayName.trim().length > 32) {
      next.displayName = "Max 32 characters";
      hasErr = true;
    }
    if (!email.trim()) {
      next.email = "Email is required";
      hasErr = true;
    } else if (!email.includes("@")) {
      next.email = "Enter a valid email";
      hasErr = true;
    }
    if (password.length < 8) {
      next.password = "Password must be at least 8 characters";
      hasErr = true;
    }
    if (password !== confirmPassword) {
      next.confirmPassword = "Passwords do not match";
      hasErr = true;
    }

    if (hasErr) {
      setFieldErrors(next);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    const { error: signErr } = await signUp(email.trim(), password, displayName.trim());
    if (signErr) {
      setError(signErr.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  const switchLogin = () => {
    navigate("/login");
    setTab("login");
    setError("");
    setFieldErrors({ displayName: "", email: "", password: "", confirmPassword: "" });
  };

  const switchRegister = () => {
    navigate("/register");
    setTab("signup");
    setError("");
    setFieldErrors({ displayName: "", email: "", password: "", confirmPassword: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <AnimatedBackground />

      <div className="relative z-10 w-full max-w-[420px] animate-scale-in">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Lock className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">CryptoChat</h1>
          </div>
          <p className="text-sm text-muted-foreground">End-to-end encryption demo</p>
        </div>

        <GlassCard className={cn("rounded-3xl p-8", shake && "animate-shake")}>
          <div className="relative flex glass rounded-full p-1 mb-8">
            <div
              className={cn(
                "absolute top-1 bottom-1 rounded-full transition-all duration-500",
                tab === "login"
                  ? "left-1 bg-primary/20 border border-primary/30"
                  : "bg-secondary/20 border border-secondary/30",
              )}
              style={{
                width: "calc(50% - 4px)",
                transform: tab === "login" ? "translateX(0)" : "translateX(calc(100% + 4px))",
              }}
            />
            <button
              type="button"
              onClick={switchLogin}
              className={cn(
                "relative z-10 flex-1 py-2 text-sm font-medium rounded-full transition-colors duration-300",
                tab === "login" ? "text-primary" : "text-muted-foreground",
              )}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={switchRegister}
              className={cn(
                "relative z-10 flex-1 py-2 text-sm font-medium rounded-full transition-colors duration-300",
                tab === "signup" ? "text-secondary" : "text-muted-foreground",
              )}
            >
              Sign Up
            </button>
          </div>

          {success && tab === "signup" ? (
            <div className="text-center py-8 space-y-4">
              <p className="text-foreground">✅ Account created! You can now log in.</p>
              <p className="text-sm text-muted-foreground">Redirecting to login…</p>
            </div>
          ) : (
            <form onSubmit={tab === "login" ? handleLogin : handleRegister} className="space-y-4">
              {tab === "signup" && (
                <div>
                  <input
                    type="text"
                    placeholder="Display name"
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      clearField("displayName");
                    }}
                    className={cn(inputClass, fieldErrors.displayName && "ring-2 ring-destructive/50")}
                  />
                  {fieldErrors.displayName && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.displayName}</p>
                  )}
                </div>
              )}

              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearField("email");
                  }}
                  className={cn(inputClass, fieldErrors.email && "ring-2 ring-destructive/50")}
                />
                {fieldErrors.email && <p className="text-xs text-destructive mt-1">{fieldErrors.email}</p>}
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearField("password");
                    }}
                    className={cn(
                      inputClass,
                      "pr-10",
                      fieldErrors.password && "ring-2 ring-destructive/50",
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-destructive mt-1">{fieldErrors.password}</p>
                )}
              </div>

              {tab === "signup" && (
                <div>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearField("confirmPassword");
                      }}
                      className={cn(
                        inputClass,
                        fieldErrors.confirmPassword && "ring-2 ring-destructive/50",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              )}

              {tab === "login" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
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
                    : "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:shadow-lg hover:shadow-secondary/20",
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
          )}
        </GlassCard>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Your messages are encrypted. We never store plain text.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
