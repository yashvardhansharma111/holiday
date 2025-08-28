import * as React from "react";

type Align = "start" | "center" | "end";
type Side = "bottom" | "top";

type PopoverContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  side: Side;
  align: Align;
};

const PopoverCtx = React.createContext<PopoverContextValue | null>(null);

export interface PopoverProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: Side;
  align?: Align;
  children: React.ReactNode;
  className?: string;
}

export function Popover({
  open: controlled,
  defaultOpen,
  onOpenChange,
  side = "bottom",
  align = "start",
  children,
  className,
}: PopoverProps) {
  const [uncontrolled, setUncontrolled] = React.useState(!!defaultOpen);
  const open = controlled ?? uncontrolled;
  const setOpen = (v: boolean) => {
    if (controlled === undefined) setUncontrolled(v);
    onOpenChange?.(v);
  };

  const triggerRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!triggerRef.current?.contains(t) && !contentRef.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <PopoverCtx.Provider value={{ open, setOpen, triggerRef, contentRef, side, align }}>
      <div className={className} style={{ position: "relative", display: "inline-block" }}>
        {children}
      </div>
    </PopoverCtx.Provider>
  );
}

export interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactElement;
}
export function PopoverTrigger({ asChild, children }: PopoverTriggerProps) {
  const ctx = React.useContext(PopoverCtx);
  if (!ctx) throw new Error("PopoverTrigger must be used within <Popover/>");
  const { open, setOpen, triggerRef } = ctx;

  const props = {
    ref: triggerRef as any,
    "aria-haspopup": "dialog",
    "aria-expanded": open,
    onClick: (e: React.MouseEvent) => {
      children.props.onClick?.(e);
      setOpen(!open);
    },
  };

  return asChild
    ? React.cloneElement(children, props)
    : React.createElement("button", { ...props, className: "inline-flex" }, children);
}

export interface PopoverContentProps extends React.HTMLAttributes<HTMLDivElement> {
  sideOffset?: number;
  /** Optional overrides (lets you pass align/side directly on Content like shadcn) */
  align?: Align;
  side?: Side;
}
export function PopoverContent({
  className,
  sideOffset = 8,
  style,
  align,
  side,
  ...rest
}: PopoverContentProps) {
  const ctx = React.useContext(PopoverCtx);
  if (!ctx) throw new Error("PopoverContent must be used within <Popover/>");
  const open = ctx.open;
  const usedAlign = align ?? ctx.align;
  const usedSide = side ?? ctx.side;
  const contentRef = ctx.contentRef;

  if (!open) return null;

  const alignClass =
    usedAlign === "start" ? "left-0"
      : usedAlign === "end" ? "right-0"
      : "left-1/2 -translate-x-1/2";

  const sideClass =
    usedSide === "top" ? `bottom-[calc(100%+${sideOffset}px)]` : `top-[calc(100%+${sideOffset}px)]`;

  return (
    <div
      ref={contentRef}
      role="dialog"
      className={[
        "absolute z-50 min-w-[12rem] rounded-md border border-slate-200 bg-white p-3 shadow-xl",
        alignClass,
        sideClass,
        className,
      ].join(" ")}
      style={style}
      {...rest}
    />
  );
}
