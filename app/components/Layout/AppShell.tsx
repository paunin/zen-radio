import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden relative bg-bg">
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(var(--color-glow),0.08) 0%, transparent 50%), " +
            "radial-gradient(ellipse at 70% 80%, rgba(var(--color-glow),0.06) 0%, transparent 50%)",
          animation: "bgShift 20s ease-in-out infinite",
          backgroundSize: "200% 200%",
        }}
      />

      {/* Glass panel */}
      <div
        className="relative z-10 flex flex-col h-full w-full max-w-[600px] mx-auto
          md:my-4 md:rounded-2xl md:border md:border-border md:h-[calc(100dvh-2rem)]
          backdrop-blur-[30px]"
        style={{ backgroundColor: "rgba(var(--color-bg-panel), 0.92)" }}
      >
        {children}
      </div>
    </div>
  );
}
