import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { EncryptionMode } from "@/hooks/useCrypto";
import {
  chunkBase64Display,
  getCaesarCharMap,
  getUtf8Bytes,
  truncateForVisual,
  VISUALIZER_MAX_CHARS,
} from "@/lib/cryptoVisual";
import { ArrowDown, Binary } from "lucide-react";

interface EncryptionLiveVisualizerProps {
  mode: EncryptionMode;
  shiftKey: number;
  inputValue: string;
  encrypted: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.035, delayChildren: 0.02 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 26 },
  },
};

const byteVariants = {
  hidden: { opacity: 0, scale: 0.75 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 22 },
  },
};

function CaesarVisualizer({ text, shiftKey }: { text: string; shiftKey: number }) {
  const reduceMotion = useReducedMotion();
  const truncated = truncateForVisual(text);
  const map = getCaesarCharMap(truncated, shiftKey);
  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 380, damping: 24 };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span>Character shifts</span>
        {truncated.length < text.length && (
          <span className="text-amber-500/90 normal-case">(first {VISUALIZER_MAX_CHARS} chars)</span>
        )}
      </div>
      <motion.div
        className="flex flex-wrap gap-2 justify-start"
        variants={reduceMotion ? undefined : containerVariants}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "show"}
        key={`${truncated}-${shiftKey}`}
      >
        {map.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">Type to see each letter shift…</span>
        ) : (
          map.map((cell, i) => (
            <motion.div
              key={`c-${i}-${cell.input}`}
              variants={reduceMotion ? undefined : itemVariants}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5 min-w-[2rem]",
                cell.shifted ? "bg-primary/10 border border-primary/25" : "bg-muted/30 border border-border/40",
              )}
            >
              <motion.span
                className="text-xs font-mono text-foreground tabular-nums"
                layout
                transition={spring}
              >
                {cell.input === " " ? "␠" : cell.input}
              </motion.span>
              {cell.shifted && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0.5, y: -2 }}
                  animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={spring}
                  className="text-[9px] text-primary/80"
                >
                  +{shiftKey % 26}
                </motion.div>
              )}
              <motion.span
                className={cn(
                  "text-sm font-mono font-semibold tabular-nums",
                  cell.shifted ? "text-primary" : "text-muted-foreground",
                )}
                layout
                transition={spring}
              >
                {cell.output === " " ? "␠" : cell.output}
              </motion.span>
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}

function Base64Visualizer({ text, encrypted }: { text: string; encrypted: string }) {
  const reduceMotion = useReducedMotion();
  const truncated = truncateForVisual(text);
  const bytes = getUtf8Bytes(truncated);
  const chunks = chunkBase64Display(encrypted);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Binary className="w-3.5 h-3.5" />
        <span>UTF-8 bytes → Base64 blocks</span>
        {truncated.length < text.length && (
          <span className="text-amber-500/90 normal-case">(first {VISUALIZER_MAX_CHARS} chars)</span>
        )}
      </div>

      <motion.div
        className="flex flex-wrap gap-1"
        variants={reduceMotion ? undefined : containerVariants}
        initial={reduceMotion ? false : "hidden"}
        animate={reduceMotion ? undefined : "show"}
        key={truncated}
      >
        {bytes.length === 0 ? (
          <span className="text-xs text-muted-foreground italic">Type to see byte values…</span>
        ) : (
          bytes.map((b, i) => (
            <motion.span
              key={`b-${i}-${b}`}
              variants={reduceMotion ? undefined : byteVariants}
              className="font-mono text-[10px] px-2 py-1 rounded-md bg-secondary/15 text-secondary border border-secondary/30"
              title={`Byte ${i}: ${b}`}
            >
              {b}
            </motion.span>
          ))
        )}
      </motion.div>

      <div className="flex justify-center py-0.5">
        <motion.div
          animate={reduceMotion ? undefined : { y: [0, 3, 0] }}
          transition={reduceMotion ? undefined : { repeat: Number.POSITIVE_INFINITY, duration: 2.2, ease: "easeInOut" }}
        >
          <ArrowDown className="w-4 h-4 text-secondary/70" />
        </motion.div>
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Encoded output (4-char groups)</p>
        <div className="flex flex-wrap gap-1.5">
          <AnimatePresence mode="popLayout">
            {chunks.length === 0 ? (
              <span className="text-xs text-muted-foreground italic">—</span>
            ) : (
              chunks.map((chunk, i) => (
                <motion.span
                  key={`${chunk}-${i}`}
                  layout
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.85, rotateX: -12 }}
                  animate={reduceMotion ? undefined : { opacity: 1, scale: 1, rotateX: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.9 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 28,
                    delay: reduceMotion ? 0 : i * 0.04,
                  }}
                  className="font-mono text-sm px-2 py-1.5 rounded-lg bg-secondary/12 text-secondary border border-secondary/35 tracking-wide"
                >
                  {chunk}
                </motion.span>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function EncryptionLiveVisualizer({ mode, shiftKey, inputValue, encrypted }: EncryptionLiveVisualizerProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-background/20 p-3 overflow-hidden">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Live visualization</p>
      {mode === "symmetric" ? (
        <CaesarVisualizer text={inputValue} shiftKey={shiftKey} />
      ) : (
        <Base64Visualizer text={inputValue} encrypted={encrypted} />
      )}
    </div>
  );
}
