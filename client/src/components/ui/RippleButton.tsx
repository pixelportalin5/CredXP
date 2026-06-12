"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface RippleButtonProps {
  children: ReactNode;
  className?: string;
}

export default function RippleButton({ children, className }: RippleButtonProps) {
  const ref = useRef<HTMLSpanElement>(null);

  const handlePointerDown = (event: MouseEvent<HTMLSpanElement>) => {
    const target = ref.current;
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const ripple = document.createElement("span");
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      transform: scale(0);
      animation: ripple-expand 0.55s ease-out forwards;
      background: rgba(255, 255, 255, 0.35);
      width: ${size}px;
      height: ${size}px;
      left: ${event.clientX - rect.left - size / 2}px;
      top: ${event.clientY - rect.top - size / 2}px;
      pointer-events: none;
    `;
    target.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  };

  const isPositioned = className?.includes("fixed") || className?.includes("absolute");

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex overflow-hidden transition-transform active:scale-[0.97]",
        !isPositioned && "relative",
        className
      )}
      onPointerDown={handlePointerDown}
    >
      {children}
    </span>
  );
}
