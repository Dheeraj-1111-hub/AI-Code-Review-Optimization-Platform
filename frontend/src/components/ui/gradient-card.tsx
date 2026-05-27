import * as React from "react";
import { cn } from "@/lib/utils";

interface GradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  animateBorder?: boolean;
}

export const GradientCard = React.forwardRef<HTMLDivElement, GradientCardProps>(
  ({ className, animateBorder = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-2xl bg-surface p-[1px]",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 bg-white/5 transition-opacity group-hover:opacity-100 opacity-50" />
        
        {animateBorder && (
          <div className="absolute inset-[-100%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#00000000_70%,#ffffff_100%)] opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        
        <div className="relative h-full w-full rounded-[calc(1rem-1px)] bg-black p-6">
          {children}
        </div>
      </div>
    );
  }
);

GradientCard.displayName = "GradientCard";
