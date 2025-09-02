// src/lib/utils.ts
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// cn() combines clsx() and tailwind-merge to handle conditional + deduplicated Tailwind classes
export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs))
}
