import { cn } from "@/lib/utils";
import type { EncryptionMode } from "@/hooks/useCrypto";

interface ModeToggleProps {
  mode: EncryptionMode;
  onModeChange: (mode: EncryptionMode) => void;
  size?: "sm" | "md";
}

const ModeToggle = ({ mode, onModeChange, size = "md" }: ModeToggleProps) => {
  const isSymmetric = mode === "symmetric";

  return (
    <div
      className={cn(
        "relative flex glass rounded-full p-1",
        size === "sm" ? "text-xs" : "text-sm"
      )}
    >
      <div
        className={cn(
          "absolute top-1 bottom-1 rounded-full transition-all duration-500",
          isSymmetric
            ? "left-1 bg-primary/20 border border-primary/30"
            : "bg-secondary/20 border border-secondary/30"
        )}
        style={{
          width: "calc(50% - 4px)",
          transform: isSymmetric ? "translateX(0)" : "translateX(calc(100% + 4px))",
        }}
      />
      <button
        onClick={() => onModeChange("symmetric")}
        className={cn(
          "relative z-10 px-3 py-1.5 rounded-full font-medium transition-colors duration-300",
          isSymmetric ? "text-primary" : "text-muted-foreground"
        )}
      >
        Symmetric
      </button>
      <button
        onClick={() => onModeChange("asymmetric")}
        className={cn(
          "relative z-10 px-3 py-1.5 rounded-full font-medium transition-colors duration-300",
          !isSymmetric ? "text-secondary" : "text-muted-foreground"
        )}
      >
        Asymmetric
      </button>
    </div>
  );
};

export default ModeToggle;
