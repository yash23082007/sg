/**
 * @file Badge.tsx
 * @description Monospace, sharp 1px-border telemetry badge for skill categories, statuses, and tags.
 * 
 * Aesthetic Specs:
 * - Font: JetBrains Mono / font-mono uppercase.
 * - Borders: Sharp 1px borders with 30-40% opacity corresponding to data severity.
 * - Transitions: Strict 150ms hover/color transitions.
 */

import React from "react";
import type { BadgeVariant } from "@/types";

interface BadgeProps {
  /** The text or icon content displayed within the badge */
  children: React.ReactNode;
  /** Signal variant: critical (rose), warning (amber), mastered (emerald), neutral (slate), info (blue) */
  variant?: BadgeVariant;
  /** Size token */
  size?: "sm" | "md";
  /** Optional custom CSS classes */
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "sm",
  className = "",
}: BadgeProps) {
  // Padding and typography size styles
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] tracking-wider",
    md: "px-2.5 py-1 text-xs tracking-wide",
  }[size];

  // Precise monochromatic and chromatic signal tokens
  const variantStyles = {
    critical:
      "border-rose-500/40 bg-rose-950/30 text-rose-400 border",
    warning:
      "border-amber-500/40 bg-amber-950/30 text-amber-400 border",
    mastered:
      "border-emerald-500/40 bg-emerald-950/30 text-emerald-400 border",
    neutral:
      "border-white/10 bg-white/[0.03] text-neutral-400 border",
    info:
      "border-blue-500/40 bg-blue-950/30 text-blue-400 border",
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-mono font-medium uppercase select-none transition-colors duration-150 ${sizeStyles} ${variantStyles} ${className}`}
    >
      {children}
    </span>
  );
}
