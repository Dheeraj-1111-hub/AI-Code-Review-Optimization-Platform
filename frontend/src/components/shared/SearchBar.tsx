import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {
  containerClassName?: string;
  onSearch?: (value: string) => void;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, containerClassName, onSearch, onChange, ...props }, ref) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
      onSearch?.(e.target.value);
    };

    return (
      <div className={cn("relative flex items-center w-full max-w-md", containerClassName)}>
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          ref={ref}
          type="text"
          className={cn(
            "flex h-10 w-full rounded-full border border-input bg-surface px-10 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:bg-surface-elevated",
            className
          )}
          onChange={handleChange}
          {...props}
        />
        <div className="absolute right-3 hidden items-center gap-1 sm:flex text-xs text-muted-foreground font-mono bg-background border border-border rounded px-1.5 py-0.5">
          <span>⌘</span><span>K</span>
        </div>
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
