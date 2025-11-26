"use client";

import { useMemo } from "react";

interface InitialsAvatarProps {
  name?: string;
  email?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const GRADIENT_PAIRS = [
  ["from-violet-500", "to-purple-600"],
  ["from-blue-500", "to-indigo-600"],
  ["from-emerald-500", "to-teal-600"],
  ["from-amber-500", "to-orange-600"],
  ["from-rose-500", "to-pink-600"],
  ["from-cyan-500", "to-blue-600"],
  ["from-fuchsia-500", "to-purple-600"],
  ["from-lime-500", "to-green-600"],
];

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

function getInitials(name?: string, email?: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  if (email) {
    const localPart = email.split("@")[0];
    return localPart.substring(0, 2).toUpperCase();
  }

  return "U";
}

function getGradientIndex(name?: string, email?: string): number {
  const str = name || email || "User";
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % GRADIENT_PAIRS.length;
}

export function InitialsAvatar({
  name,
  email,
  size = "md",
  className = "",
}: InitialsAvatarProps) {
  const initials = useMemo(() => getInitials(name, email), [name, email]);
  const gradientIndex = useMemo(
    () => getGradientIndex(name, email),
    [name, email]
  );
  const [fromColor, toColor] = GRADIENT_PAIRS[gradientIndex];

  return (
    <div
      className={` ${sizeClasses[size]} bg-gradient-to-br ${fromColor} ${toColor} flex items-center justify-center rounded-full font-bold text-white shadow-lg ring-2 ring-white/20 ${className} `}
    >
      {initials}
    </div>
  );
}

export default InitialsAvatar;
