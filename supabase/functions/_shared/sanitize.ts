// Shared utilities for input validation and HTML sanitization across edge functions

/** Escape HTML special characters to prevent XSS in email templates */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

/** Truncate string to max length */
export function truncate(str: string, maxLen: number): string {
  return typeof str === "string" ? str.slice(0, maxLen) : "";
}

/** Validate that a string is within length bounds */
export function isWithinLength(str: unknown, min: number, max: number): boolean {
  return typeof str === "string" && str.length >= min && str.length <= max;
}
