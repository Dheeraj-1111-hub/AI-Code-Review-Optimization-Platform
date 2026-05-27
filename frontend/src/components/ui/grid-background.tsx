import * as React from "react";
import { cn } from "@/lib/utils";

interface GridBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "dot" | "grid";
  maskFade?: boolean;
}

export function GridBackground({
  className,
  variant = "grid",
  maskFade = true,
  ...props
}: GridBackgroundProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 pointer-events-none z-0",
        variant === "dot" ? "bg-dot-pattern" : "bg-grid-pattern",
        className
      )}
      {...props}
    >
      {maskFade && (
        <div className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      )}
    </div>
  );
}
