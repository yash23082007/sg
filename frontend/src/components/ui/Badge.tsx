import React from "react";
import type { BadgeVariant } from "@/types";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  size = "sm",
  className = "",
}: BadgeProps) {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] tracking-wider",
    md: "px-2.5 py-1 text-xs tracking-wide",
  }[size];

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
