import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "strong";
  children: React.ReactNode;
}

const GlassCard = ({ variant = "default", className, children, ...props }: GlassCardProps) => {
  return (
    <div
      className={cn(
        variant === "default" ? "glass" : "glass-strong",
        "transition-all duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
