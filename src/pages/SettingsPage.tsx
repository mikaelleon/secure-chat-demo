import { useState } from "react";
import { LogOut, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/GlassCard";
import ModeToggle from "@/components/ModeToggle";
import type { EncryptionMode } from "@/hooks/useCrypto";

interface SettingsPageProps {
  mode: EncryptionMode;
  onModeChange: (mode: EncryptionMode) => void;
  shiftKey: number;
  onShiftKeyChange: (key: number) => void;
  onLogout: () => void;
  onClearLog: () => void;
}

const SettingsPage = ({ mode, onModeChange, shiftKey, onShiftKeyChange, onLogout, onClearLog }: SettingsPageProps) => {
  const [displayName, setDisplayName] = useState("John Doe");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-1 space-y-4">
      <h1 className="text-xl font-semibold text-foreground mb-4">Settings</h1>

      {/* Profile */}
      <GlassCard className="rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Profile</p>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold text-lg shrink-0">
            {displayName.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Display name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full glass rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <input
                type="email"
                value="john@crypto.chat"
                readOnly
                className="w-full glass rounded-xl px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl text-sm font-medium bg-primary/20 text-primary hover:bg-primary/30 transition-all duration-300"
            >
              {saved ? "✓ Saved" : "Save"}
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Encryption defaults */}
      <GlassCard className="rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Encryption Defaults</p>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Default mode</label>
            <ModeToggle mode={mode} onModeChange={onModeChange} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Default shift key</label>
            <input
              type="number"
              min={1}
              max={25}
              value={shiftKey}
              onChange={(e) => onShiftKeyChange(Number(e.target.value) || 1)}
              className="w-20 glass rounded-xl px-4 py-2.5 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
            />
          </div>
        </div>
      </GlassCard>

      {/* Session */}
      <GlassCard className="rounded-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Session</p>
        <div className="flex gap-3">
          <button
            onClick={onClearLog}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all duration-300"
          >
            <Trash2 className="w-4 h-4" />
            Clear session log
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm border border-border/30 text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-all duration-300"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </GlassCard>
    </div>
  );
};

export default SettingsPage;
