import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/GlassCard";
import AnimatedBackground from "@/components/AnimatedBackground";
import { useAuthContext } from "@/context/AuthContext";

export default function ProfilePage() {
  const { profile, user, updateProfile, updatePassword, signOut } = useAuthContext();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  async function handleUpdateProfile() {
    setProfileError("");
    if (!displayName.trim()) {
      setProfileError("Display name cannot be empty");
      return;
    }
    setProfileLoading(true);
    const { error } = await updateProfile(displayName.trim());
    if (error) {
      setProfileError(error);
    } else {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
    setProfileLoading(false);
  }

  async function handleUpdatePassword() {
    setPasswordError("");
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setPasswordLoading(true);
    const { error } = await updatePassword(newPassword);
    if (error) {
      setPasswordError(error.message);
    } else {
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
    setPasswordLoading(false);
  }

  async function handleSignOut() {
    await signOut();
    navigate("/login");
  }

  const subCard =
    "rounded-xl px-4 py-3 glass border border-border/20 bg-background/30";

  return (
    <div className="min-h-screen relative overflow-auto p-4 md:p-8">
      <AnimatedBackground />
      <div className="relative z-10 max-w-xl mx-auto space-y-6">
        <button
          type="button"
          onClick={() => navigate("/chat")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to chat
        </button>

        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>

        <GlassCard className="rounded-2xl p-6 space-y-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Account</p>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Read-only</p>
            <div className={subCard}>
              <span className="text-[10px] uppercase text-muted-foreground">Email</span>
              <p className="text-sm text-foreground mt-1">{user?.email ?? "—"}</p>
            </div>
            <div className={subCard}>
              <span className="text-[10px] uppercase text-muted-foreground">User ID</span>
              <p className="text-xs font-mono text-muted-foreground mt-1 break-all">{user?.id ?? "—"}</p>
            </div>
            <div className={subCard}>
              <span className="text-[10px] uppercase text-muted-foreground">Joined</span>
              <p className="text-sm text-foreground mt-1">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          <div className="border-t border-border/30 pt-6 space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Display name</p>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {profileError && <p className="text-xs text-destructive">{profileError}</p>}
            {profileSuccess && <p className="text-xs text-primary">Saved successfully.</p>}
            <button
              type="button"
              disabled={profileLoading}
              onClick={() => void handleUpdateProfile()}
              className={cn(
                "px-5 py-2 rounded-xl text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-all",
                "disabled:opacity-50 inline-flex items-center gap-2",
              )}
            >
              {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save name
            </button>
          </div>

          <div className="border-t border-border/30 pt-6 space-y-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">New password</p>
            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full glass rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {passwordError && <p className="text-xs text-destructive">{passwordError}</p>}
            {passwordSuccess && <p className="text-xs text-primary">Password updated.</p>}
            <button
              type="button"
              disabled={passwordLoading}
              onClick={() => void handleUpdatePassword()}
              className={cn(
                "px-5 py-2 rounded-xl text-sm font-medium bg-secondary/20 text-secondary hover:bg-secondary/30 transition-all",
                "disabled:opacity-50 inline-flex items-center gap-2",
              )}
            >
              {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Update password
            </button>
          </div>

          <div className="border-t border-border/30 pt-6">
            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-border/30 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
