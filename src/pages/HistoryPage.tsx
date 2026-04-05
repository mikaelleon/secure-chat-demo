import { useState } from "react";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/GlassCard";
import { mockHistory } from "@/data/mockData";

const HistoryPage = () => {
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | "symmetric" | "asymmetric">("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = mockHistory.filter((entry) => {
    if (modeFilter !== "all" && entry.mode !== modeFilter) return false;
    if (search && !entry.original.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 p-1">
      <h1 className="text-xl font-semibold text-foreground mb-4">Message History</h1>

      {/* Filters */}
      <GlassCard className="rounded-2xl p-4 mb-4 shrink-0">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search messages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full glass rounded-xl pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
            />
          </div>
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value as typeof modeFilter)}
            className="glass rounded-xl px-4 py-2 text-sm text-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Modes</option>
            <option value="symmetric">Symmetric</option>
            <option value="asymmetric">Asymmetric</option>
          </select>
          <input
            type="date"
            className="glass rounded-xl px-4 py-2 text-sm text-muted-foreground bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </GlassCard>

      {/* Table */}
      <GlassCard className="rounded-2xl flex-1 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No message history yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="p-3 text-left text-xs uppercase tracking-widest text-muted-foreground font-medium">Time</th>
                <th className="p-3 text-left text-xs uppercase tracking-widest text-muted-foreground font-medium">Mode</th>
                <th className="p-3 text-left text-xs uppercase tracking-widest text-muted-foreground font-medium">Original</th>
                <th className="p-3 text-left text-xs uppercase tracking-widest text-muted-foreground font-medium">Encrypted</th>
                <th className="p-3 text-left text-xs uppercase tracking-widest text-muted-foreground font-medium">Key</th>
                <th className="p-3 text-left text-xs uppercase tracking-widest text-muted-foreground font-medium">Partner</th>
                <th className="p-3 w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <>
                  <tr
                    key={entry.id}
                    onClick={() => setExpandedRow(expandedRow === entry.id ? null : entry.id)}
                    className="border-b border-border/20 hover:bg-muted/10 cursor-pointer transition-colors duration-200"
                  >
                    <td className="p-3 text-muted-foreground text-xs">{entry.timestamp}</td>
                    <td className="p-3">
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
                    </td>
                    <td className="p-3 text-foreground max-w-[150px] truncate">{entry.original}</td>
                    <td className="p-3 font-mono text-xs max-w-[150px] truncate text-muted-foreground">
                      {entry.encrypted}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{entry.shift ?? "—"}</td>
                    <td className="p-3 text-foreground text-xs">{entry.partner}</td>
                    <td className="p-3">
                      {expandedRow === entry.id ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </td>
                  </tr>
                  {expandedRow === entry.id && (
                    <tr key={`${entry.id}-exp`}>
                      <td colSpan={7} className="p-0">
                        <GlassCard className="m-2 rounded-xl p-4 animate-fade-in-up space-y-2">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Original</span>
                            <p className="text-sm text-foreground">{entry.original}</p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Encrypted</span>
                            <p className={cn("text-xs font-mono break-all", entry.mode === "symmetric" ? "text-primary" : "text-secondary")}>
                              {entry.encrypted}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Decrypted</span>
                            <p className="text-sm text-foreground">{entry.decrypted}</p>
                          </div>
                        </GlassCard>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </div>
  );
};

export default HistoryPage;
