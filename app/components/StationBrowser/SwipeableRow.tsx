import { useRef, useCallback, type ReactNode } from "react";
import { Icon } from "~/components/ui/Icon";

const THRESHOLD = 80;

interface SwipeableRowProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftIcon?: string;
  rightIcon?: string;
  leftColor?: string;
  rightColor?: string;
  children: ReactNode;
}

export function SwipeableRow({
  onSwipeLeft,
  onSwipeRight,
  leftIcon = "trash",
  rightIcon = "star",
  leftColor = "rgba(180, 40, 40, 0.85)",
  rightColor = "rgba(160, 130, 20, 0.75)",
  children,
}: SwipeableRowProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const leftBgRef = useRef<HTMLDivElement>(null);
  const rightBgRef = useRef<HTMLDivElement>(null);
  const leftIconRef = useRef<SVGSVGElement>(null);
  const rightIconRef = useRef<SVGSVGElement>(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const swiping = useRef(false);
  const decided = useRef(false);

  const updateBackgrounds = useCallback((dx: number) => {
    if (rightBgRef.current) {
      rightBgRef.current.style.visibility = dx > 0 ? "visible" : "hidden";
    }
    if (leftBgRef.current) {
      leftBgRef.current.style.visibility = dx < 0 ? "visible" : "hidden";
    }
    if (rightIconRef.current) {
      const progress = Math.min(1, Math.max(0, dx / THRESHOLD));
      rightIconRef.current.style.opacity = `${0.2 + progress * 0.8}`;
    }
    if (leftIconRef.current) {
      const progress = Math.min(1, Math.max(0, -dx / THRESHOLD));
      leftIconRef.current.style.opacity = `${0.2 + progress * 0.8}`;
    }
  }, []);

  const resetPosition = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    el.style.transition = "transform 250ms ease-out";
    el.style.transform = "translateX(0)";
    currentX.current = 0;
    updateBackgrounds(0);
  }, [updateBackgrounds]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    currentX.current = 0;
    swiping.current = false;
    decided.current = false;

    const el = contentRef.current;
    if (el) {
      el.style.transition = "none";
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const dx = touch.clientX - startX.current;
      const dy = touch.clientY - startY.current;

      if (!decided.current) {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        if (absDx < 8 && absDy < 8) return;
        decided.current = true;
        if (absDy > absDx) {
          swiping.current = false;
          return;
        }
        swiping.current = true;
      }

      if (!swiping.current) return;

      let clampedDx = dx;
      if (clampedDx < 0 && !onSwipeLeft) clampedDx = 0;
      if (clampedDx > 0 && !onSwipeRight) clampedDx = 0;

      currentX.current = clampedDx;
      const el = contentRef.current;
      if (el) {
        el.style.transform = `translateX(${clampedDx}px)`;
      }
      updateBackgrounds(clampedDx);
    },
    [onSwipeLeft, onSwipeRight, updateBackgrounds]
  );

  const handleTouchEnd = useCallback(() => {
    if (!swiping.current) return;

    const dx = currentX.current;

    if (dx > THRESHOLD && onSwipeRight) {
      onSwipeRight();
    } else if (dx < -THRESHOLD && onSwipeLeft) {
      onSwipeLeft();
    }

    resetPosition();
    swiping.current = false;
    decided.current = false;
  }, [onSwipeLeft, onSwipeRight, resetPosition]);

  return (
    <div className="relative overflow-hidden">
      {/* Left background — revealed on swipe right (star/fav) */}
      {onSwipeRight && (
        <div
          ref={rightBgRef}
          className="absolute inset-0 flex items-center pl-8"
          style={{ background: rightColor, visibility: "hidden" }}
        >
          <Icon ref={rightIconRef} name={rightIcon} size={22} className="text-white" style={{ opacity: 0.2 }} />
        </div>
      )}

      {/* Right background — revealed on swipe left (delete) */}
      {onSwipeLeft && (
        <div
          ref={leftBgRef}
          className="absolute inset-0 flex items-center justify-end pr-8"
          style={{ background: leftColor, visibility: "hidden" }}
        >
          <Icon ref={leftIconRef} name={leftIcon} size={22} className="text-white" style={{ opacity: 0.2 }} />
        </div>
      )}

      {/* Foreground content */}
      <div
        ref={contentRef}
        className="relative bg-bg"
        style={{ touchAction: "pan-y" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={resetPosition}
      >
        {children}
      </div>
    </div>
  );
}
