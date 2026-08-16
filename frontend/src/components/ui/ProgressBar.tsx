interface ProgressBarProps {
  value: number; // 0 to 100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  status?: "mastered" | "proficient" | "developing" | "critical" | "auto";
}

export function ProgressBar({
  value,
  size = "md",
  showLabel = false,
  status = "auto",
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  // Determine color status based on value if 'auto'
  let resolvedStatus = status;
  if (resolvedStatus === "auto") {
    if (clampedValue >= 80) resolvedStatus = "mastered";
    else if (clampedValue >= 60) resolvedStatus = "proficient";
    else if (clampedValue >= 40) resolvedStatus = "developing";
    else resolvedStatus = "critical";
  }

  const heightClass = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2.5",
  }[size];

  const colorClass = {
    mastered: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
    proficient: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
    developing: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    critical: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
  }[resolvedStatus];

  return (
    <div className="w-full flex items-center gap-3">
      <div className={`relative flex-1 ${heightClass} bg-neutral-900 border border-white/5 overflow-hidden`}>
        <div
          className={`h-full ${colorClass} transition-transform duration-300 ease-out origin-left`}
          style={{
            transform: `scaleX(${clampedValue / 100})`,
            width: "100%",
          }}
        />
      </div>
      {showLabel && (
        <span className="font-mono text-xs text-neutral-300 w-10 text-right font-medium">
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
