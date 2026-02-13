import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export function Card({ className, glow, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-800 bg-gray-900/80 backdrop-blur-sm",
        glow && "shadow-lg shadow-brand-500/5",
        className
      )}
      {...props}
    />
  );
}
