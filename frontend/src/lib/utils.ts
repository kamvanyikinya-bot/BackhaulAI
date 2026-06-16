import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: any[]) { return twMerge(clsx(inputs)); }

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-800', booked: 'bg-blue-100 text-blue-800',
    in_transit: 'bg-yellow-100 text-yellow-800', delivered: 'bg-gray-100 text-gray-600',
    cancelled: 'bg-red-100 text-red-800', verified: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800', active: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
}

export function statusLabel(status: string): string {
  return status.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}