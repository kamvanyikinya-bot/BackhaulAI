import { cn } from '../../lib/utils';
export function Badge({ status, className, children }: { status: string; className?: string; children?: React.ReactNode }) {
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-700', in_transit: 'bg-blue-100 text-blue-700',
    completed: 'bg-gray-100 text-gray-600', verified: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700', active: 'bg-green-100 text-green-700',
  };
  return <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colors[status] || 'bg-gray-100 text-gray-600', className)}>{children || status.replace('_', ' ')}</span>;
}