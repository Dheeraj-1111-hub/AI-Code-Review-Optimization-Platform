import { Link } from "@tanstack/react-router";
import { Terminal } from "lucide-react";

export function Logo({ to = "/" }: { to?: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 group">
      <div className="relative h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center shadow-sm">
        <Terminal className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <div className="leading-none">
        <span className="font-semibold tracking-tight text-base">DevLens</span>
        <span className="text-gradient font-semibold"> AI</span>
      </div>
    </Link>
  );
}
