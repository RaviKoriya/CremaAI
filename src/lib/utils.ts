import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import { CURRENCIES } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  const curr = CURRENCIES.find((c) => c.value === currency);
  const symbol = curr?.symbol ?? currency;

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  return `${symbol}${formatted}`;
}

export function formatDate(date: string | Date, formatStr: string = "MMM d, yyyy"): string {
  return format(new Date(date), formatStr);
}

export function formatRelativeDate(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getDaysAgo(date: string | Date): number {
  return differenceInDays(new Date(), new Date(date));
}

export function getLeadAgingStatus(createdAt: string): "healthy" | "warning" | "critical" {
  const days = getDaysAgo(createdAt);
  if (days < 7) return "healthy";
  if (days < 30) return "warning";
  return "critical";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-().]{7,20}$/.test(phone);
}
