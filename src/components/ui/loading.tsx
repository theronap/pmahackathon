import { cn } from "@/lib/utils";

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="h-2 w-2 rounded-full bg-brand-400 animate-[bounce_1s_ease-in-out_infinite]" />
      <span className="h-2 w-2 rounded-full bg-brand-400 animate-[bounce_1s_ease-in-out_0.15s_infinite]" />
      <span className="h-2 w-2 rounded-full bg-brand-400 animate-[bounce_1s_ease-in-out_0.3s_infinite]" />
    </div>
  );
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-brand-400",
        className
      )}
    />
  );
}
