import * as React from "react";

type Variant = "default" | "primary" | "secondary" | "outline" | "ghost" | "destructive" | "link";
type Size = "sm" | "md" | "lg" | "icon";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  default:
    "bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-emerald-600/50",
  primary:
    "bg-emerald-600 text-white hover:bg-emerald-500 disabled:bg-emerald-600/50",
  secondary:
    "bg-slate-800 text-white hover:bg-slate-700 disabled:bg-slate-800/50",
  outline:
    "border border-slate-300 text-slate-800 hover:bg-slate-50 disabled:opacity-60 bg-transparent",
  ghost:
    "text-slate-700 hover:bg-slate-100 disabled:opacity-60",
  destructive:
    "bg-rose-600 text-white hover:bg-rose-500 disabled:bg-rose-600/50",
  link:
    "text-emerald-600 underline underline-offset-4 hover:text-emerald-500 disabled:opacity-60",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed",
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-transparent" />
        ) : null}
        <span className={cn(isLoading && "ml-2")}>{children}</span>
      </button>
    );
  }
);
Button.displayName = "Button";
