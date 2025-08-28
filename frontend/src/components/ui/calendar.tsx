import * as React from "react";

function cn(...c: Array<string | false | null | undefined>) {
  return c.filter(Boolean).join(" ");
}

function startOfDay(d: Date) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function isSameDay(a: Date, b: Date) { return startOfDay(a).getTime() === startOfDay(b).getTime(); }
function addMonths(d: Date, n: number) { const x = new Date(d); x.setMonth(x.getMonth() + n); return x; }
function daysInMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth()+1, 0).getDate(); }
function firstDayOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function clamp(date: Date, min?: Date, max?: Date) {
  let t = date.getTime();
  if (min && t < startOfDay(min).getTime()) t = startOfDay(min).getTime();
  if (max && t > startOfDay(max).getTime()) t = startOfDay(max).getTime();
  return new Date(t);
}

const WEEKDAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export interface CalendarProps {
  value?: Date | null;
  onChange?: (date: Date) => void;
  min?: Date;
  max?: Date;
  disabled?: (date: Date) => boolean;
  className?: string;
}

export function Calendar({
  value = null,
  onChange,
  min,
  max,
  disabled,
  className,
}: CalendarProps) {
  const today = React.useMemo(() => startOfDay(new Date()), []);
  const initialView = value ?? today;
  const [view, setView] = React.useState<Date>(firstDayOfMonth(initialView));

  const select = (d: Date) => {
    if (disabled?.(d)) return;
    const picked = clamp(d, min, max);
    onChange?.(picked);
  };

  const prev = () => setView(v => addMonths(v, -1));
  const next = () => setView(v => addMonths(v, 1));

  // grid building
  const first = firstDayOfMonth(view);
  const startIdx = first.getDay();
  const count = daysInMonth(view);

  const cells: Array<Date | null> = Array.from({ length: startIdx }, () => null)
    .concat(Array.from({ length: count }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1)));

  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className={cn("w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-sm", className)}>
      {/* header */}
      <div className="mb-2 flex items-center justify-between">
        <button
          onClick={prev}
          className="h-8 w-8 rounded-md text-slate-700 hover:bg-slate-100"
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="select-none text-sm font-semibold text-slate-800">
          {MONTHS[view.getMonth()]} {view.getFullYear()}
        </div>
        <button
          onClick={next}
          className="h-8 w-8 rounded-md text-slate-700 hover:bg-slate-100"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* weekdays */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wide text-slate-400">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* days */}
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="h-9" />;
          const outOfRange =
            (min && d < startOfDay(min)) || (max && d > startOfDay(max)) || disabled?.(d);
          const selected = value && isSameDay(d, value);
          const isToday = isSameDay(d, today);

          return (
            <button
              key={i}
              onClick={() => select(d)}
              disabled={outOfRange}
              className={cn(
                "h-9 rounded-md text-sm transition-colors",
                outOfRange && "text-slate-300 cursor-not-allowed",
                !selected && !outOfRange && "hover:bg-slate-100",
                selected && "bg-emerald-600 text-white hover:bg-emerald-600",
                !selected && isToday && "ring-1 ring-emerald-500"
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
