import * as React from "react";

type Variant =
  | "default"
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "link"
  | "gradientSolid"
  | "gradientOutline";

type Size = "sm" | "md" | "lg" | "icon";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
  ghost: "text-slate-700 hover:bg-slate-100 disabled:opacity-60",
  destructive:
    "bg-rose-600 text-white hover:bg-rose-500 disabled:bg-rose-600/50",
  link: "text-emerald-600 underline underline-offset-4 hover:text-emerald-500 disabled:opacity-60",

  // NEW: Gradient Variants
  gradientSolid:
    "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md hover:opacity-90",
  gradientOutline:
    "relative text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500 border-2 border-transparent \
     before:absolute before:inset-0 before:rounded-md before:p-[2px] before:bg-gradient-to-r before:from-purple-600 before:to-pink-500 \
     before:-z-10 hover:opacity-90 bg-transparent",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-10 w-10 p-0",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "default", size = "md", isLoading, children, ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "relative inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:cursor-not-allowed",
          VARIANTS[variant],
          SIZES[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="absolute left-3 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        <span className={cn(isLoading && "opacity-70 ml-2")}>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
