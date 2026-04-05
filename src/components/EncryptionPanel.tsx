import { cn } from "@/lib/utils";
import GlassCard from "./GlassCard";
import { useCrypto, type EncryptionMode } from "@/hooks/useCrypto";

interface LogEntry {
  original: string;
  encrypted: string;
  mode: EncryptionMode;
  timestamp: string;
}

interface EncryptionPanelProps {
  mode: EncryptionMode;
  shiftKey: number;
  inputValue: string;
  sessionLog: LogEntry[];
}

const EncryptionPanel = ({ mode, shiftKey, inputValue, sessionLog }: EncryptionPanelProps) => {
  const { encrypt, decrypt } = useCrypto();

  const encrypted = encrypt(inputValue, mode, shiftKey);
  const decrypted = decrypt(encrypted, mode, shiftKey);

  return (
    <GlassCard className="w-[340px] h-full rounded-2xl flex flex-col shrink-0 overflow-hidden">
      <div className="p-4 border-b border-border/30">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Encryption Inspector
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Mode info */}
        <GlassCard className="rounded-xl p-4 animate-scale-in" key={mode}>
          <h3
            className={cn(
              "text-lg font-semibold transition-colors duration-500",
              mode === "symmetric" ? "text-primary" : "text-secondary"
            )}
          >
            {mode === "symmetric" ? "Caesar Cipher" : "Base64 Encoding"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {mode === "symmetric"
              ? "Shifts each letter by a fixed number of positions in the alphabet."
              : "Encodes text into Base64 format — a reversible encoding scheme."}
          </p>
          <p className="text-xs mt-2 font-mono text-muted-foreground">
            {mode === "symmetric" ? `Shift Key: ${shiftKey}` : "No key — encoding only"}
          </p>
        </GlassCard>

        {/* Live preview */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Live Preview
          </p>
          <div className="space-y-2">
            <GlassCard className="rounded-xl p-3">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Input</span>
              <p className="text-sm text-foreground mt-1 min-h-[20px]">
                {inputValue || <span className="text-muted-foreground italic">Start typing...</span>}
              </p>
            </GlassCard>
            <GlassCard className="rounded-xl p-3">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Encrypted</span>
              <p
                className={cn(
                  "font-mono text-xs mt-1 break-all min-h-[20px]",
                  mode === "symmetric" ? "text-primary" : "text-secondary"
                )}
              >
                {encrypted || "—"}
              </p>
            </GlassCard>
            <GlassCard className="rounded-xl p-3">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Decrypted</span>
              <p className="text-sm text-foreground mt-1 min-h-[20px]">{decrypted || "—"}</p>
            </GlassCard>
          </div>
        </div>

        {/* Session log */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Session Log
          </p>
          {sessionLog.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">No messages sent yet.</p>
          ) : (
            <div className="space-y-1.5">
              {sessionLog.map((entry, i) => (
                <GlassCard key={i} className="rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full",
                        entry.mode === "symmetric"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary/10 text-secondary"
                      )}
                    >
                      {entry.mode === "symmetric" ? "SYM" : "ASY"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{entry.timestamp}</span>
                  </div>
                  <p className="text-xs text-foreground truncate">{entry.original}</p>
                  <p
                    className={cn(
                      "text-[10px] font-mono truncate mt-0.5",
                      entry.mode === "symmetric" ? "text-primary/70" : "text-secondary/70"
                    )}
                  >
                    {entry.encrypted}
                  </p>
                </GlassCard>
              ))}
            </div>
          )}
        </div>

        {/* Comparison */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Comparison
          </p>
          <GlassCard className="rounded-xl overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="p-2 text-left text-muted-foreground font-medium" />
                  <th className="p-2 text-center text-primary font-medium">Symmetric</th>
                  <th className="p-2 text-center text-secondary font-medium">Asymmetric</th>
                </tr>
              </thead>
              <tbody className="text-muted-foreground">
                <tr className="border-b border-border/20">
                  <td className="p-2">Key</td>
                  <td className="p-2 text-center">Shared</td>
                  <td className="p-2 text-center">None (demo)</td>
                </tr>
                <tr className="border-b border-border/20">
                  <td className="p-2">Speed</td>
                  <td className="p-2 text-center">Fast</td>
                  <td className="p-2 text-center">Slower</td>
                </tr>
                <tr>
                  <td className="p-2">Security</td>
                  <td className="p-2 text-center">Moderate</td>
                  <td className="p-2 text-center">Higher</td>
                </tr>
              </tbody>
            </table>
          </GlassCard>
        </div>
      </div>
    </GlassCard>
  );
};

export default EncryptionPanel;
