"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";

export function BackgroundBeams({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      setCursorPosition({ x: clientX, y: clientY });
    };

    const handleMouseEnter = () => {
      setIsActive(true);
    };

    const handleMouseLeave = () => {
      setIsActive(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseenter", handleMouseEnter);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={backgroundRef}
      className={cn(
        "h-full w-full absolute inset-0 overflow-hidden",
        className
      )}
      style={{
        background: `
          radial-gradient(
            600px circle at ${cursorPosition.x}px ${cursorPosition.y}px,
            rgba(129, 91, 245, 0.15),
            transparent 40%
          )
        `,
        opacity: isActive ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
      {...props}
    />
  );
}