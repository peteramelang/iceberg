import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const POPOVER_WIDTH = 280;
const GAP = 8;

interface InfoDotProps {
  reasoning: string;
  label?: string;
}

// A 14px "i" glyph button that toggles a small popover containing the
// `reasoning` text. Click outside or press Escape to dismiss. The popover
// is portalled to document.body so it escapes any overflow-hidden ancestor.
export function InfoDot({ reasoning, label = "Why this was picked" }: InfoDotProps) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; placement: "above" | "below" } | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const popoverId = useId();

  // Compute popover position synchronously after open flips true so the
  // popover never flashes at (0,0). useLayoutEffect runs before paint.
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const viewportW = window.innerWidth;
    // Place below by default; flip above if trigger sits in the bottom third.
    const placeAbove = rect.bottom > (viewportH * 2) / 3;
    const top = placeAbove
      ? rect.top + window.scrollY - GAP // popover sits above; its bottom edge will be rect.top - GAP after transform
      : rect.bottom + window.scrollY + GAP;

    // Horizontal: align popover left edge with trigger left edge, clamp to viewport.
    let left = rect.left + window.scrollX;
    const overflowRight = left + POPOVER_WIDTH - (window.scrollX + viewportW - 8);
    if (overflowRight > 0) left -= overflowRight;
    if (left < window.scrollX + 8) left = window.scrollX + 8;

    setPos({ top, left, placement: placeAbove ? "above" : "below" });
  }, [open]);

  // Outside-click + Escape dismissal. One listener registered while open.
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (
        target &&
        !triggerRef.current?.contains(target) &&
        !popoverRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-describedby={open ? popoverId : undefined}
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-pill border border-current text-text-dim hover:text-text-mute text-[9px] font-semibold leading-none align-middle"
      >
        i
      </button>
      {open && pos && createPortal(
        <div
          ref={popoverRef}
          id={popoverId}
          style={{
            position: "absolute",
            top: pos.top,
            left: pos.left,
            width: POPOVER_WIDTH,
            zIndex: 50,
            ...(pos.placement === "above" ? { transform: "translateY(-100%)" } : {}),
          }}
          className="bg-panel border border-border-soft rounded p-md shadow-card text-body text-text leading-[1.5]"
        >
          {reasoning}
        </div>,
        document.body
      )}
    </>
  );
}
