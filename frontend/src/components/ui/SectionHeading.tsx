import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  badge?: string;
}

export function SectionHeading({
  title,
  description,
  badge,
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-1 mb-6", className)} {...props}>
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-foreground font-heading">
          {title}
        </h2>
        {badge && (
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
