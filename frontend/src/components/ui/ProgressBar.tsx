/**
 * @file ProgressBar.tsx
 * @description Hardware-accelerated progress bar adhering to the Anti-Vibe-Coded design manifesto.
 * 
 * Architectural Constraints:
 * 1. Geometry: Sharp 1px border grid, no heavy rounded pills (avoids `rounded-3xl`).
 * 2. Kinematics: Strictly animates `transform: scaleX()` along the X-axis for 60fps rendering
 *    without causing browser reflow or layout thrashing.
 * 3. Color Logic: Dopamine utility colors mapped to skill status:
 *    - Emerald (>= 80%): Mastered
 *    - Blue (60-79%): Proficient
 *    - Amber (40-59%): Developing
 *    - Rose (< 40%): Critical Gap
 */

interface ProgressBarProps {
  /** Numerical value representing proficiency or progress (0 - 100) */
  value: number;
  /** Size variant controlling vertical height */
  size?: "sm" | "md" | "lg";
  /** If true, renders a monospace percentage label next to the bar */
  showLabel?: boolean;
  /** Explicit status color override, or 'auto' to derive from value */
  status?: "mastered" | "proficient" | "developing" | "critical" | "auto";
}

export function ProgressBar({
  value,
  size = "md",
  showLabel = false,
  status = "auto",
}: ProgressBarProps) {
  // Clamp value between 0 and 100 to prevent layout distortion
  const clampedValue = Math.min(100, Math.max(0, value));

  // Determine signal status based on percentage threshold when set to 'auto'
  let resolvedStatus = status;
  if (resolvedStatus === "auto") {
    if (clampedValue >= 80) resolvedStatus = "mastered";
    else if (clampedValue >= 60) resolvedStatus = "proficient";
    else if (clampedValue >= 40) resolvedStatus = "developing";
    else resolvedStatus = "critical";
  }

  // Height mappings with sharp geometric borders
  const heightClass = {
    sm: "h-1",
    md: "h-1.5",
    lg: "h-2.5",
  }[size];

  // Neon signal color definitions for data anomalies
  const colorClass = {
    mastered: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
    proficient: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
    developing: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
    critical: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
  }[resolvedStatus];

  return (
    <div className="w-full flex items-center gap-3">
      {/* Outer track: Monochromatic deep slate with subtle 1px border */}
      <div className={`relative flex-1 ${heightClass} bg-neutral-900 border border-white/5 overflow-hidden`}>
        {/* Fill bar: Uses transform scaleX for zero-reflow hardware-accelerated animations */}
        <div
          className={`h-full ${colorClass} transition-transform duration-300 ease-out origin-left`}
          style={{
            transform: `scaleX(${clampedValue / 100})`,
            width: "100%",
          }}
        />
      </div>

      {/* Technical monospace value display */}
      {showLabel && (
        <span className="font-mono text-xs text-neutral-300 w-10 text-right font-medium">
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
