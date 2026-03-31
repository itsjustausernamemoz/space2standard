import type { OrderStatus } from '../types';

/**
 * Format a numeric amount as a currency string.
 */
export function formatCurrency(
  amount: number,
  currency = 'ZAR',
  locale = 'en-ZA'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate the discounted price based on discount type and value.
 */
export function calcDiscount(
  price: number,
  type: 'percent' | 'fixed' | null,
  value: number | null
): number {
  if (!type || value === null || value <= 0) return price;
  if (type === 'percent') {
    return Math.max(0, price - (price * value) / 100);
  }
  return Math.max(0, price - value);
}

/**
 * Calculate VAT amount from a subtotal.
 */
export function calcVAT(subtotal: number, vatRate: number): number {
  return (subtotal * vatRate) / 100;
}

/**
 * Calculate grand total: subtotal - discount + VAT.
 */
export function calcGrandTotal(
  subtotal: number,
  discountTotal: number,
  vatRate: number
): { vatAmount: number; grandTotal: number } {
  const afterDiscount = subtotal - discountTotal;
  const vatAmount = calcVAT(afterDiscount, vatRate);
  return {
    vatAmount,
    grandTotal: afterDiscount + vatAmount,
  };
}

/**
 * Human-readable label for an order status.
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    new: 'New',
    contacted: 'Contacted',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status] ?? status;
}

/**
 * Return a Tailwind colour class for each order status.
 */
export function getOrderStatusColor(status: OrderStatus): string {
  const colors: Record<OrderStatus, string> = {
    new: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    contacted: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    in_progress: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    completed: 'bg-green-500/20 text-green-300 border-green-500/30',
    cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
  };
  return colors[status] ?? 'bg-gray-500/20 text-gray-300';
}

/**
 * Truncate text to a maximum length with an ellipsis.
 */
export function truncate(text: string, maxLength = 80): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

/**
 * Format a date string into a readable format.
 */
export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
}
