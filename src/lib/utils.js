import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Format a numeric value as CRC currency (₡) with no decimals and space thousands separator.
 * Mirrors the certificate backend formatting (₡123 456).
 */
export function formatCRC(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return `₡${Math.trunc(n).toLocaleString('en-US').replaceAll(',', ' ')}`;
}

export function formatUSD(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return `$${Math.trunc(n).toLocaleString('en-US').replaceAll(',', ' ')}`;
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(dateString));
  if (!m) return dateString;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

/** Debounce helper for use inside `$effect` blocks. */
export function debounce(fn, wait = 300) {
  let timer;
  const wrapped = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  wrapped.cancel = () => clearTimeout(timer);
  return wrapped;
}
