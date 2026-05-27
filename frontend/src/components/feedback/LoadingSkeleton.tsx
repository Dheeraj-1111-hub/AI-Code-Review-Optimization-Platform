import * as React from "react";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "shimmer" | "pulse";
}

export function LoadingSkeleton({
  className,
  variant = "shimmer",
  ...props
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-surface-elevated/50",
        variant === "shimmer" ? "shimmer relative overflow-hidden" : "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
      <div className="space-y-2">
        <LoadingSkeleton className="h-4 w-1/3" />
        <LoadingSkeleton className="h-3 w-1/2" />
      </div>
      <LoadingSkeleton className="h-24 w-full rounded-lg" />
      <div className="flex justify-end pt-2">
        <LoadingSkeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <LoadingSkeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <LoadingSkeleton className="h-4 w-full" />
            <LoadingSkeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
