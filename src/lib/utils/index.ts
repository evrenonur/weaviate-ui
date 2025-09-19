import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

export function truncateString(str: string, maxLength: number = 50): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isValidGraphQL(query: string): boolean {
  // Basic GraphQL validation
  const trimmed = query.trim();
  return trimmed.startsWith("{") && trimmed.endsWith("}");
}