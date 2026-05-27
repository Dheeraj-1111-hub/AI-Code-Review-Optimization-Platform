import { cn } from "@/lib/utils";
import React from "react";

export const MovingBorder = ({
  children,
  className,
  containerClassName,
  borderWidth = "1px",
}: {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  borderWidth?: string;
}) => {
  return (
    <div
      className={cn(
        "relative rounded-[16px] overflow-hidden group",
        containerClassName
      )}
      style={{ padding: borderWidth }}
    >
      <style>
        {`
          @keyframes border-spin {
            100% {
              transform: rotate(360deg);
            }
          }
          .animate-border-spin {
            animation: border-spin 4s linear infinite;
          }
        `}
      </style>
      <div
        className="absolute inset-0 h-[200%] w-[200%] top-[-50%] left-[-50%] animate-border-spin z-0 opacity-20 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: "conic-gradient(from 90deg at 50% 50%, #09090b 40%, rgba(99, 102, 241, 0.5) 50%, #09090b 60%)",
        }}
      />
      <div
        className={cn(
          "relative h-full w-full bg-[#09090b] rounded-[15px] z-10 flex flex-col overflow-hidden",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
};
