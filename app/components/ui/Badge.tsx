import { memo } from "react";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge = memo(function Badge({ children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[0.65rem] rounded bg-white/5 text-text-secondary ${className}`}
    >
      {children}
    </span>
  );
});
