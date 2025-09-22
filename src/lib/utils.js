import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// cn = className utility (ShadCN requires this)
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
